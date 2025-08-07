// Real Authentication Provider - Spring Boot + JWT + Google OAuth
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { UserWithRole } from '@/types/roles';

interface RealAuthContextValue {
  user: UserWithRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  error: string | null;
}

const RealAuthContext = createContext<RealAuthContextValue | undefined>(undefined);

interface RealAuthProviderProps {
  children: ReactNode;
}

export const RealAuthProvider: React.FC<RealAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid tokens
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        if (authService.isTokenExpired()) {
          await authService.refreshToken();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        await logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        setError(`OAuth error: ${error}`);
        router.push('/login');
        return;
      }

      if (code && window.location.pathname === '/auth/callback') {
        setIsLoading(true);
        try {
          const response = await authService.loginWithGoogle(code);
          setUser(response.user);
          setError(null);
          
          // Clear URL parameters and redirect
          window.history.replaceState({}, document.title, '/dashboard');
          router.push('/dashboard');
        } catch (error: any) {
          setError(error.response?.data?.message || 'Login failed');
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [router]);

  const loginWithGoogle = () => {
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!);
    googleAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');

    window.location.href = googleAuthUrl.toString();
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setError(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: RealAuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
    error,
  };

  return (
    <RealAuthContext.Provider value={value}>
      {children}
    </RealAuthContext.Provider>
  );
};

export const useRealAuth = (): RealAuthContextValue => {
  const context = useContext(RealAuthContext);
  if (context === undefined) {
    throw new Error('useRealAuth must be used within a RealAuthProvider');
  }
  return context;
};