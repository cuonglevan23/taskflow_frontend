// DEPRECATED: UserContext - Replaced by AuthProvider
// This context is no longer used - we've switched to simplified AuthProvider
// See /src/components/auth/AuthProvider.tsx for the new authentication system

"use client";

import React, { createContext, useContext, ReactNode } from 'react';

/*
 * MIGRATION NOTES:
 * - UserContext đã được thay thế bởi AuthProvider
 * - Authentication giờ được handle hoàn toàn bởi backend
 * - Sử dụng HTTP-only cookies thay vì manual token management
 * - User data được fetch trực tiếp từ backend API
 *
 * Migration guide:
 * OLD: const { user, updateProfile } = useUser();
 * NEW: const { user, refreshAuth } = useAuth();
 *      await ApiClient.updateUserProfile(data);
 *      await refreshAuth();
 */

// Deprecated interfaces - kept for backward compatibility
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultView: 'list' | 'board' | 'calendar';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  preferences?: UserPreferences;
  lastLoginAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  refreshUser: () => Promise<void>;
  canAccessManager: () => boolean;
  canAccessAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

// Deprecated context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Deprecated provider - kept for backward compatibility but doesn't do anything
export function UserProvider({ children }: { children: ReactNode }) {
  console.warn('⚠️ UserProvider is deprecated. Use AuthProvider instead.');

  const deprecatedContextValue: UserContextType = {
    user: null,
    isLoading: false,
    error: 'UserContext is deprecated. Use AuthProvider instead.',
    isAuthenticated: false,
    userRole: null,
    updateProfile: async () => {
      throw new Error('UserContext is deprecated. Use AuthProvider and ApiClient instead.');
    },
    updatePreferences: async () => {
      throw new Error('UserContext is deprecated. Use AuthProvider and ApiClient instead.');
    },
    updateAvatar: async () => {
      throw new Error('UserContext is deprecated. Use AuthProvider and ApiClient instead.');
    },
    refreshUser: async () => {
      throw new Error('UserContext is deprecated. Use AuthProvider instead.');
    },
    canAccessManager: () => false,
    canAccessAdmin: () => false,
    hasRole: () => false,
  };

  return (
    <UserContext.Provider value={deprecatedContextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Deprecated hook - kept for backward compatibility
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  console.warn('⚠️ useUser is deprecated. Use useAuth from AuthProvider instead.');
  return context;
}
