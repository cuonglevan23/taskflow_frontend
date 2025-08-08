// Mock Authentication Provider for Development
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserWithRole } from '@/types/roles';
import { DemoJWTService, DemoTokenStorage } from '@/utils/demoJWT';

interface MockAuthContextValue {
  user: UserWithRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  error: string | null;
  // JWT Demo features
  accessToken: string | null;
  refreshToken: string | null;
  tokenInfo: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isExpired: boolean;
    expiresAt: Date | null;
    accessTokenPayload: {
      sub: string;
      email: string;
      name: string;
      role: UserRole;
      iat: number;
      exp: number;
      projectRoles?: Record<string, UserRole>;
    } | null;
    refreshTokenPayload: {
      sub: string;
      type?: string;
      iat: number;
      exp: number;
    } | null;
  };
  refreshAccessToken: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextValue | undefined>(undefined);

// Mock users with different roles
const MOCK_USERS: UserWithRole[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    projectRoles: {
      'project-1': 'admin',
      'project-2': 'admin',
    }
  },
  {
    id: '2',
    name: 'John Owner',
    email: 'owner@company.com',
    role: 'owner',
    projectRoles: {
      'project-1': 'owner',
      'project-2': 'owner',
    }
  },
  {
    id: '3',
    name: 'Sarah Manager',
    email: 'pm@company.com',
    role: 'project_manager',
    projectRoles: {
      'project-1': 'project_manager',
      'project-2': 'leader',
    }
  },
  {
    id: '4',
    name: 'Mike Leader',
    email: 'leader@company.com',
    role: 'leader',
    projectRoles: {
      'project-1': 'leader',
      'project-2': 'member',
    }
  },
  {
    id: '5',
    name: 'Anna Member',
    email: 'member@company.com',
    role: 'member',
    projectRoles: {
      'project-1': 'member',
      'project-2': 'member',
    }
  }
];

interface MockAuthProviderProps {
  children: ReactNode;
  defaultRole?: UserRole;
  enableDevMode?: boolean;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ 
  children, 
  defaultRole = 'member',
  enableDevMode = process.env.NODE_ENV === 'development'
}) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Initialize with default user and JWT tokens
  useEffect(() => {
    const initializeAuth = () => {
      // Check if user was previously logged in with JWT tokens
      const storedAccessToken = DemoTokenStorage.getAccessToken();
      const savedUser = localStorage.getItem('mock_auth_user');
      
      if (storedAccessToken && !DemoTokenStorage.isTokenExpired() && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setAccessToken(storedAccessToken);
          setRefreshToken(DemoTokenStorage.getRefreshToken());
        } catch (e) {
          console.error('Failed to parse saved user:', e);
          DemoTokenStorage.clearTokens();
        }
      }
      // Disabled auto-login to allow manual role testing
      // } else if (enableDevMode) {
      //   // Auto-login with default role in dev mode
      //   const defaultUser = MOCK_USERS.find(u => u.role === defaultRole) || MOCK_USERS[4];
      //   const tokens = DemoJWTService.generateTokenPair(defaultUser);
      //   
      //   setUser(defaultUser);
      //   setAccessToken(tokens.accessToken);
      //   setRefreshToken(tokens.refreshToken);
      //   
      //   localStorage.setItem('mock_auth_user', JSON.stringify(defaultUser));
      //   DemoTokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
      // }
      
      setIsLoading(false);
    };

    // Simulate loading delay
    setTimeout(initializeAuth, 500);
  }, [defaultRole, enableDevMode]);

  const login = async (email: string, password: string, role?: UserRole): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we're in development mode and should use mock auth
      const isDevelopment = process.env.NODE_ENV === 'development';
      const useBackend = process.env.NEXT_PUBLIC_API_URL && !role; // Use backend if API URL is set and no specific role requested

      if (useBackend && !isDevelopment) {
        // Real backend authentication
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const { accessToken, refreshToken, userInfo } = await response.json();
        
        // Transform backend user data to frontend format
        const user = {
          id: userInfo.id.toString(),
          email: userInfo.email,
          name: `${userInfo.firstName} ${userInfo.lastName}`.trim() || userInfo.email,
          role: 'member', // Default role, can be enhanced based on backend roles
          avatar: userInfo.avatarUrl,
          isFirstLogin: userInfo.isFirstLogin
        };
        
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        
        localStorage.setItem('mock_auth_user', JSON.stringify(user));
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
      } else {
        // Mock authentication for development
        await new Promise(resolve => setTimeout(resolve, 1000));

        let mockUser: UserWithRole;
        
        if (role) {
          mockUser = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[4];
        } else {
          mockUser = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[4];
        }

        if (email === 'fail@test.com') {
          throw new Error('Invalid credentials');
        }

        const tokens = await DemoJWTService.generateTokenPair(mockUser);
        
        setUser(mockUser);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        
        localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
        DemoTokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear all state
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setError(null);
      
      // Clear all localStorage data
      localStorage.removeItem('mock_auth_user');
      localStorage.clear(); // Clear everything to be safe
      
      // Clear all tokens and cookies
      DemoTokenStorage.clearTokens();
      
      console.log('🚪 Logout completed - all tokens and data cleared');
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (role: UserRole): void => {
    if (!user) return;

    const newUser = MOCK_USERS.find(u => u.role === role);
    if (newUser) {
      DemoJWTService.generateTokenPair(newUser).then(tokens => {
        setUser(newUser);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        
        localStorage.setItem('mock_auth_user', JSON.stringify(newUser));
        DemoTokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
      });
    }
  };

  const switchUser = (userId: string): void => {
    const newUser = MOCK_USERS.find(u => u.id === userId);
    if (newUser) {
      DemoJWTService.generateTokenPair(newUser).then(tokens => {
        setUser(newUser);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        
        localStorage.setItem('mock_auth_user', JSON.stringify(newUser));
        DemoTokenStorage.storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
      });
    }
  };

  const refreshAccessToken = async (): Promise<void> => {
    if (!user || !refreshToken) return;

    try {
      const newTokens = await DemoJWTService.refreshAccessToken(refreshToken, user);
      if (newTokens) {
        setAccessToken(newTokens.accessToken);
        DemoTokenStorage.storeTokens(newTokens.accessToken, refreshToken, newTokens.expiresIn);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const value: MockAuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    switchUser,
    error,
    accessToken,
    refreshToken,
    tokenInfo: DemoTokenStorage.getTokenInfo(),
    refreshAccessToken,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = (): MockAuthContextValue => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

// Export mock users for testing
export { MOCK_USERS };