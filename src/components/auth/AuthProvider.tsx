// Auth Guard - Bảo vệ routes và quản lý authentication state
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService } from '@/lib/auth-backend';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Refs for managing timers and activity tracking
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  // Configuration constants
  const REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes (refresh before 5min expiry)
  const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity before logout
  const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  const refreshAuth = useCallback(async () => {
    // Prevent multiple simultaneous refresh calls
    if (isRefreshingRef.current) {
      return;
    }

    try {
      isRefreshingRef.current = true;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/user-profiles/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();

        const formattedUser: User = {
          id: userData.id?.toString() || userData.userId?.toString() || '1',
          email: userData.email || 'user@example.com',
          name: userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : userData.name || userData.email || 'User',
          role: userData.role || 'USER',
          avatar: userData.avatar || userData.avatarUrl,
        };

        setUser(formattedUser);
        setIsAuthenticated(true);

        // Update last activity time on successful auth
        lastActivityRef.current = Date.now();
        console.log('✅ Auth refresh successful');
      } else if (response.status === 401) {
        // 401 = Token hết hạn hoặc không hợp lệ
        // Backend sẽ tự động try refresh token, nếu fail thì mới clear state
        console.log('❌ Auth check failed with 401 - token may be expired');

        // Đợi một chút để backend có thể tự refresh token
        setTimeout(() => {
          if (!isAuthenticated) {
            console.log('🚪 No auth recovery, redirecting to login');
            setUser(null);
            setIsAuthenticated(false);
          }
        }, 2000);
      } else {
        // Các lỗi khác (403, 500, etc.)
        console.log('❌ Auth check failed with status:', response.status);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth refresh error:', error);
      // Chỉ clear state nếu là lỗi nghiêm trọng, không phải network timeout
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('🌐 Network error during auth check - keeping current state');
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [isAuthenticated]);

  // Handle user activity tracking
  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing activity timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Set new activity timeout
    activityTimeoutRef.current = setTimeout(() => {
      console.log('User inactive for 30 minutes, logging out...');
      logout();
    }, ACTIVITY_TIMEOUT);
  }, []);

  // Setup automatic refresh and activity monitoring
  const setupAutoRefresh = useCallback(() => {
    // Clear existing intervals
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Only setup auto-refresh if authenticated
    if (!isAuthenticated) {
      return;
    }

    // Setup periodic token refresh
    refreshIntervalRef.current = setInterval(async () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;

      // Only refresh if user has been active recently (within 30 minutes)
      if (timeSinceLastActivity < ACTIVITY_TIMEOUT) {
        console.log('Auto-refreshing authentication...');
        await refreshAuth();
      }
    }, REFRESH_INTERVAL);

    // Setup activity tracking
    handleUserActivity(); // Initialize activity timeout

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    console.log('Auto-refresh and activity monitoring setup complete');
  }, [isAuthenticated, refreshAuth, handleUserActivity]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }

    // Remove activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      document.removeEventListener(event, handleUserActivity);
    });
  }, [handleUserActivity]);

  const login = async () => {
    try {
      await AuthService.loginWithGoogle();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Cleanup timers and listeners
      cleanup();

      await AuthService.logout();

      setUser(null);
      setIsAuthenticated(false);

      router.replace('/');

    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/');

    } finally {
      setIsLoading(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    refreshAuth();
  }, []);

  // Setup auto-refresh when authentication state changes
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setupAutoRefresh();
      } else {
        cleanup();
      }
    }

    // Cleanup on unmount
    return cleanup;
  }, [isAuthenticated, isLoading, setupAutoRefresh, cleanup]);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = ['/login', '/auth/success', '/auth/error', '/'].includes(pathname) || pathname.startsWith('/auth/');

    if (isAuthenticated && pathname === '/login') {
      router.replace('/home');
    } else if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Enhanced AuthGuard component
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, fallback, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();

  // Public routes
  const publicRoutes = ['/login', '/register', '/auth/callback', '/auth/success', '/auth/error', '/'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth/');

  // Loading state
  if (isLoading) {
    return (
        fallback || (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
              </div>
            </div>
        )
    );
  }

  // Public routes - always allow
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes - require authentication
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Đang chuyển hướng đến trang đăng nhập...
            </h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
    );
  }

  // Role-based protection
  if (requiredRole && user?.role !== requiredRole) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-600">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600">
              Bạn không có quyền truy cập vào trang này.
            </p>
          </div>
        </div>
    );
  }

  return <>{children}</>;
}
