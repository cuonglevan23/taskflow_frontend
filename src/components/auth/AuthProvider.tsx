// Auth Guard - Bảo vệ routes và quản lý authentication state
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  // Public routes không cần authentication
  const publicRoutes = ['/login', '/auth/success', '/auth/error', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);

      // Call the correct backend endpoint
      console.log('🔄 Checking authentication via /api/user-profiles/me');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/user-profiles/me`, {
        method: 'GET',
        credentials: 'include', // Include HTTP-only cookies
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Authentication successful:', userData);

        setIsAuthenticated(true);
        setUser({
          id: userData.id || userData.userId,
          email: userData.email,
          name: userData.name || userData.displayName,
          role: userData.role || 'MEMBER',
          avatar: userData.avatar || userData.avatarUrl
        });
      } else {
        console.log('❌ Authentication failed:', response.status);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth refresh failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      // Lưu current URL để redirect sau khi login
      if (!isPublicRoute) {
        localStorage.setItem('returnUrl', pathname);
      }

      await AuthService.loginWithGoogle();
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('❌ Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    refreshAuth();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    // Nếu đang ở public route và đã authenticated, redirect về home
    if (isPublicRoute && isAuthenticated && pathname !== '/auth/success' && pathname !== '/auth/error') {
      router.push('/home'); // Thay đổi từ '/dashboard' thành '/home'
      return;
    }

    // Nếu đang ở protected route và chưa authenticated, redirect về login
    if (!isPublicRoute && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router]);

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

// Hook để sử dụng Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Component bảo vệ trang
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Public routes
  const publicRoutes = ['/login', '/auth/success', '/auth/error', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  return <>{children}</>;
}
