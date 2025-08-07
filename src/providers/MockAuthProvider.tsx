// Mock Authentication Provider for Development
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserWithRole } from '@/types/roles';

interface MockAuthContextValue {
  user: UserWithRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  error: string | null;
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

  // Initialize with default user
  useEffect(() => {
    const initializeAuth = () => {
      // Check if user was previously logged in (localStorage)
      const savedUser = localStorage.getItem('mock_auth_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('Failed to parse saved user:', e);
        }
      } else if (enableDevMode) {
        // Auto-login with default role in dev mode
        const defaultUser = MOCK_USERS.find(u => u.role === defaultRole) || MOCK_USERS[4];
        setUser(defaultUser);
        localStorage.setItem('mock_auth_user', JSON.stringify(defaultUser));
      }
      
      setIsLoading(false);
    };

    // Simulate loading delay
    setTimeout(initializeAuth, 500);
  }, [defaultRole, enableDevMode]);

  const login = async (email: string, password: string, role?: UserRole): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user by email or role
      let mockUser: UserWithRole;
      
      if (role) {
        mockUser = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[4];
      } else {
        mockUser = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[4];
      }

      // Simulate login validation
      if (email === 'fail@test.com') {
        throw new Error('Invalid credentials');
      }

      setUser(mockUser);
      localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
      
      setUser(null);
      localStorage.removeItem('mock_auth_user');
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (role: UserRole): void => {
    if (!user) return;

    const newUser = MOCK_USERS.find(u => u.role === role);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('mock_auth_user', JSON.stringify(newUser));
    }
  };

  const switchUser = (userId: string): void => {
    const newUser = MOCK_USERS.find(u => u.id === userId);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('mock_auth_user', JSON.stringify(newUser));
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