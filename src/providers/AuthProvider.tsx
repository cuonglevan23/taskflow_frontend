"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserWithRole } from '@/types/roles';

interface AuthContextValue {
  user: UserWithRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Helper function to clear cookies
  const clearCookie = (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Initialize authentication from cookies
  useEffect(() => {
    const initializeAuth = () => {
      // Check for user data in cookies - support both token names
      const token = getCookie('access_token') || getCookie('token');
      const userRole = getCookie('userRole');
      const userId = getCookie('userId');
      const userName = getCookie('userName');
      const userEmail = getCookie('userEmail');
      const userAvatar = getCookie('userAvatar');
      
      if (token && userRole && userId && userName && userEmail) {
        const backendUser: UserWithRole = {
          id: userId,
          name: decodeURIComponent(userName.replace(/\+/g, ' ')),
          email: decodeURIComponent(userEmail),
          role: userRole as UserRole,
          avatar: userAvatar ? decodeURIComponent(userAvatar) : undefined,
          projectRoles: {}
        };
        
        setUser(backendUser);
      }
      
      setIsLoading(false);
    };

    // Small delay to ensure cookies are set before reading
    setTimeout(initializeAuth, 100);
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // For OAuth callback, this is just a dummy function
      // Real login happens through OAuth flow which sets cookies
      if (password === 'oauth-login') {
        // OAuth login already handled by callback, just refresh user data
        const token = getCookie('token');
        const userRole = getCookie('userRole');
        const userId = getCookie('userId');
        const userName = getCookie('userName');
        const userEmail = getCookie('userEmail');
        const userAvatar = getCookie('userAvatar');
        
        if (token && userRole && userId && userName && userEmail) {
          const backendUser: UserWithRole = {
            id: userId,
            name: decodeURIComponent(userName.replace(/\+/g, ' ')),
            email: decodeURIComponent(userEmail),
            role: userRole as UserRole,
            avatar: userAvatar ? decodeURIComponent(userAvatar) : undefined,
            projectRoles: {}
          };
          
          setUser(backendUser);
        }
      } else {
        // Regular login would go to backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        // Backend should set cookies, refresh user data
        const token = getCookie('token');
        const userRole = getCookie('userRole');
        const userId = getCookie('userId');
        const userName = getCookie('userName');
        const userEmailCookie = getCookie('userEmail');
        const userAvatar = getCookie('userAvatar');
        
        if (token && userRole && userId && userName && userEmailCookie) {
          const backendUser: UserWithRole = {
            id: userId,
            name: decodeURIComponent(userName.replace(/\+/g, ' ')),
            email: decodeURIComponent(userEmailCookie),
            role: userRole as UserRole,
            avatar: userAvatar ? decodeURIComponent(userAvatar) : undefined,
            projectRoles: {}
          };
          
          setUser(backendUser);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Clear all state
      setUser(null);
      setError(null);
      
      // Clear cookies
      clearCookie('access_token');
      clearCookie('userRole');
      clearCookie('userId');
      clearCookie('userName');
      clearCookie('userEmail');
      clearCookie('userAvatar');
      clearCookie('refresh_token');
      
      // Optional: Call backend logout endpoint
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch (err) {
        // Ignore logout API errors
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};