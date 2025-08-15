"use client";

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  ReactNode 
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserData } from '@/hooks/useUserData';
import type { User } from '@/types/auth';
import { UserRole } from '@/constants/auth';

// User Preferences Interface
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

// Extended User Profile Interface
export interface UserProfile extends User {
  preferences?: UserPreferences;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// User Context Type
export interface UserContextType {
  // User Data
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Authentication State
  isAuthenticated: boolean;
  userRole: UserRole | null;
  
  // User Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateAvatar: (avatarFile: File) => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Permission Helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessManager: boolean;
  canAccessAdmin: boolean;
  
  // Cache Management
  clearUserCache: () => void;
}

// Default Preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'en',
  timezone: 'UTC',
  emailNotifications: true,
  pushNotifications: true,
  defaultView: 'list',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
};

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider Props
interface UserProviderProps {
  children: ReactNode;
}

// User Provider Component
export function UserProvider({ children }: UserProviderProps) {
  // Local State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  // Hooks
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    user: backendUser, 
    isLoading: backendLoading, 
    error: backendError,
    refetch: refetchBackendUser,
    updateUser: updateBackendUser,
    updateAvatar: updateBackendAvatar
  } = useUserData();

  // Cache TTL (5 minutes)
  const CACHE_TTL = 5 * 60 * 1000;

  // Combine auth and backend user data
  const combineUserData = useCallback((auth: any, backend: User | null): UserProfile | null => {
    if (!auth && !backend) return null;
    
    // Start with auth user as base
    const combined: UserProfile = {
      id: auth?.id || backend?.id || '',
      email: auth?.email || backend?.email || '',
      name: auth?.name || backend?.name || '',
      avatar: backend?.avatar || auth?.image || auth?.avatar || '',
      role: (backend?.role || auth?.role || UserRole.MEMBER) as UserRole,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(backend?.preferences || {}),
      },
      lastLoginAt: backend?.lastLoginAt,
      createdAt: backend?.createdAt,
      updatedAt: backend?.updatedAt,
    };

    return combined;
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      await refetchBackendUser();
      setLastFetch(Date.now());
    } catch (err: any) {
      setError(err.message || 'Failed to refresh user data');
    }
  }, [refetchBackendUser]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      
      // Update backend
      await updateBackendUser(updates);
      
      // Update local state optimistically
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Refresh from backend to ensure consistency
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  }, [updateBackendUser, refreshUser]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    try {
      setError(null);
      
      const updatedPreferences = {
        ...userProfile?.preferences,
        ...preferences,
      };
      
      await updateProfile({ preferences: updatedPreferences });
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
      throw err;
    }
  }, [userProfile?.preferences, updateProfile]);

  // Update avatar
  const updateAvatar = useCallback(async (avatarFile: File) => {
    try {
      setError(null);
      await updateBackendAvatar(avatarFile);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to update avatar');
      throw err;
    }
  }, [updateBackendAvatar, refreshUser]);

  // Role helpers
  const hasRole = useCallback((role: UserRole): boolean => {
    return userProfile?.role === role;
  }, [userProfile?.role]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return userProfile?.role ? roles.includes(userProfile.role) : false;
  }, [userProfile?.role]);

  // Permission helpers
  const canAccessManager = useMemo(() => {
    return hasAnyRole([UserRole.PM, UserRole.OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  }, [hasAnyRole]);

  const canAccessAdmin = useMemo(() => {
    return hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER]);
  }, [hasAnyRole]);

  // Clear cache
  const clearUserCache = useCallback(() => {
    setUserProfile(null);
    setLastFetch(0);
    setError(null);
  }, []);

  // Update user profile when data changes
  useEffect(() => {
    const combined = combineUserData(authUser, backendUser);
    setUserProfile(combined);
    
    // Update loading state
    const loading = authLoading || backendLoading;
    setIsLoading(loading);
    
    // Update error state
    setError(backendError);
  }, [authUser, backendUser, authLoading, backendLoading, backendError, combineUserData]);

  // Auto-refresh user data when cache expires
  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;
    
    const now = Date.now();
    const cacheExpired = now - lastFetch > CACHE_TTL;
    
    if (cacheExpired && !isLoading) {
      refreshUser();
    }
  }, [isAuthenticated, userProfile, lastFetch, isLoading, refreshUser, CACHE_TTL]);

  // Context value
  const contextValue: UserContextType = useMemo(() => ({
    // User Data
    user: userProfile,
    isLoading,
    error,
    
    // Authentication State
    isAuthenticated,
    userRole: userProfile?.role || null,
    
    // User Actions
    updateProfile,
    updatePreferences,
    updateAvatar,
    refreshUser,
    
    // Permission Helpers
    hasRole,
    hasAnyRole,
    canAccessManager,
    canAccessAdmin,
    
    // Cache Management
    clearUserCache,
  }), [
    userProfile,
    isLoading,
    error,
    isAuthenticated,
    updateProfile,
    updatePreferences,
    updateAvatar,
    refreshUser,
    hasRole,
    hasAnyRole,
    canAccessManager,
    canAccessAdmin,
    clearUserCache,
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use UserContext
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}

// Export types
export type { UserContextType, UserProfile, UserPreferences };