// AuthProvider.tsx - Bảo vệ routes và quản lý authentication state
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
  isFirstLogin?: boolean; // Add first login detection
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

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth/');

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  // Config
  const REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
  const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  /** Refresh authentication */
  const refreshAuth = useCallback(async () => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/user-profiles/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
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
          isFirstLogin: userData.isFirstLogin // Map isFirstLogin field
        };

        setUser(formattedUser);
        setIsAuthenticated(true);
        lastActivityRef.current = Date.now();
      } else if (response.status === 401) {
        // Token invalid / expired
        setUser(null);
        setIsAuthenticated(false);

        // Only redirect to login if not already on a public route or auth callback
        if (!isPublicRoute && !pathname.startsWith('/auth/')) {
          router.replace('/login');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [router, isPublicRoute, pathname]); // Add pathname to dependencies

  /** Handle user activity */
  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);

    activityTimeoutRef.current = setTimeout(() => {
      logout();
    }, ACTIVITY_TIMEOUT);
  }, []);

  /** Setup auto-refresh + activity monitoring */
  const setupAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);

    if (!isAuthenticated) return;

    refreshIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity < ACTIVITY_TIMEOUT) {
        refreshAuth();
      }
    }, REFRESH_INTERVAL);

    handleUserActivity();
    ACTIVITY_EVENTS.forEach(event => document.addEventListener(event, handleUserActivity, { passive: true }));
  }, [isAuthenticated, refreshAuth, handleUserActivity]);

  /** Cleanup timers and listeners */
  const cleanup = useCallback(() => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    ACTIVITY_EVENTS.forEach(event => document.removeEventListener(event, handleUserActivity));
  }, [handleUserActivity]);

  /** Login / Logout */
  const login = async () => await AuthService.loginWithGoogle();
  const logout = async () => {
    setIsLoading(true);
    cleanup();
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.replace('/');
    setIsLoading(false);
  };

  // Initial auth check
  useEffect(() => {
    refreshAuth();
  }, []);

  // Auto-refresh when user changes
  useEffect(() => {
    if (user) setupAutoRefresh();
    else cleanup();
    return cleanup;
  }, [user, setupAutoRefresh, cleanup]);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && pathname === '/login') router.replace('/home');
    else if (!isAuthenticated && !isPublicRoute) router.replace('/login');
  }, [isAuthenticated, isLoading, pathname, router, isPublicRoute]);

  const contextValue: AuthContextType = { user, isLoading, isAuthenticated, login, logout, refreshAuth };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

/** AuthGuard component */
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, fallback, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();

  const publicRoutes = ['/login', '/register', '/auth/callback', '/auth/success', '/auth/error', '/'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth/');

  if (isLoading) {
    return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
    );
  }

  if (isPublicRoute) return <>{children}</>;

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Redirecting to login...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
            <p className="text-gray-600">You do not have permission to view this page.</p>
          </div>
        </div>
    );
  }

  return <>{children}</>;
}
