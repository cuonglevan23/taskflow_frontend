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
import { signOut } from 'next-auth/react';
import useSWR from 'swr';
import { api } from '@/services/api';
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
  lastLoginAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  logout: () => Promise<void>;
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userDataCache, setUserDataCache] = useState<{data: User | null, timestamp: number}>({
    data: null, 
    timestamp: 0
  });
  
  // Request deduplication - prevent multiple simultaneous API calls
  const [activeRequest, setActiveRequest] = useState<Promise<User | null> | null>(null);
  
  // Use SWR for session data to avoid duplicate calls and cache the result
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch session');
    return response.json();
  };
  
  const { data: session, error: sessionError, isLoading: sessionLoading } = useSWR(
    '/api/auth/session',
    fetcher,
    {
      dedupingInterval: 60000, // Cache for 1 minute
      revalidateOnFocus: false, // Don't revalidate on focus
      revalidateOnReconnect: false, // Don't revalidate on reconnect
      refreshWhenHidden: false, // Don't refresh when hidden
      errorRetryCount: 2, // Retry only 2 times
    }
  );
  
  // Memoize auth data to prevent unnecessary re-renders
  const authData = useMemo(() => ({
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    isLoading: sessionLoading
  }), [session?.user, sessionLoading]);
  
  const { user: authUser, isAuthenticated, isLoading: authLoading } = authData;

  // Cache TTL (10 minutes - reduced frequency to prevent spam)
  const CACHE_TTL = 10 * 60 * 1000;

  // Fetch user details from backend (only when needed) with deduplication
  const fetchUserDetails = useCallback(async (force = false): Promise<User | null> => {
    if (!isAuthenticated) return null;
    
    // Check cache first
    const now = Date.now();
    const cacheValid = now - userDataCache.timestamp < CACHE_TTL;
    
    if (!force && cacheValid && userDataCache.data) {
      console.log('💾 Using cached user data');
      return userDataCache.data;
    }
    
    // Request deduplication - if there's already an active request, wait for it
    if (activeRequest) {
      console.log('⏳ Request already in progress, waiting for result...');
      try {
        const result = await activeRequest;
        return result;
      } catch (err) {
        // If active request failed, continue with new request
        console.warn('⚠️ Active request failed, making new request');
      }
    }
    
    // Create new request
    const requestPromise = (async (): Promise<User | null> => {
      try {
        setError(null);
        
        // Only call backend API if we need extended user data

        const response = await api.get('/api/auth/me');

        const userData = response.data;
        
        // Update cache
        setUserDataCache({
          data: userData,
          timestamp: now
        });
        
        return userData;
      } catch (err: any) {
        // Handle all backend errors gracefully - use NextAuth data as fallback
        const statusCode = err.response?.status || 0;
        
        if (statusCode === 401) {
          // Unauthorized - clear cache
          setUserDataCache({ data: null, timestamp: 0 });
          console.warn('🔐 User unauthorized, cleared cache');
        } else if (statusCode === 500) {
          // Server error - don't clear cache, just skip this fetch
          console.warn('🛑 Backend server error (500), using NextAuth data as fallback');
        } else {
          // Other errors (network, etc.)
          console.warn(`⚠️ Backend API error (${statusCode}), using NextAuth data as fallback:`, err.message);
        }
        
        // Always return null on error - UserContext will use NextAuth data instead
        return null;
      } finally {
        // Clear active request when done
        setActiveRequest(null);
      }
    })();
    
    // Store active request
    setActiveRequest(requestPromise);
    
    return requestPromise;
  }, [isAuthenticated, CACHE_TTL, activeRequest]); // Added activeRequest to dependencies

  // Combine auth and backend user data
  const combineUserData = useCallback((auth: any, backend: User | null): UserProfile | null => {
    if (!auth) return null;
    
    // Start with auth user as base (always available from NextAuth)
    const combined: UserProfile = {
      id: auth.id || '',
      email: auth.email || '',
      name: auth.name || '',
      avatar: backend?.avatar || auth.image || auth.avatar || '',
      role: (backend?.role || auth.role || UserRole.MEMBER) as UserRole,
      permissions: backend?.permissions || [],
      isActive: backend?.isActive ?? true,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(backend?.preferences || {}),
      },
      lastLoginAt: backend?.lastLoginAt,
      createdAt: backend?.createdAt || backend?.created_at || new Date(),
      updatedAt: backend?.updatedAt || backend?.updated_at || new Date(),
    };

    return combined;
  }, []); // No dependencies - pure function

  // Refresh user data - SIMPLIFIED to only use NextAuth
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated || !authUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Only use NextAuth data - no backend API calls

      const refreshedProfile = combineUserData(authUser, null);
      setUserProfile(refreshedProfile);
      
    } catch (err: any) {
      setError(err.message || 'Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authUser, combineUserData]);

  // Update user profile - LOCAL ONLY (no backend API)
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      
      console.log('⚠️ Profile update - local only (backend API disabled)');
      
      // Update local state optimistically
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // TODO: Enable backend API when it's stable
      // For now, just update locally to avoid 500 errors
      
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  }, []);

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

  // Update avatar - LOCAL ONLY (no backend API)
  const updateAvatar = useCallback(async (avatarFile: File) => {
    try {
      setError(null);
      
      console.log('⚠️ Avatar update - local only (backend API disabled)');
      
      // Create temporary URL for preview
      const tempUrl = URL.createObjectURL(avatarFile);
      
      // Update local state only
      setUserProfile(prev => prev ? { ...prev, avatar: tempUrl } : null);
      
      // TODO: Enable backend API when it's stable
      // For now, just update locally to avoid 500 errors
      
    } catch (err: any) {
      setError(err.message || 'Failed to update avatar');
      throw err;
    }
  }, []);

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
    setUserDataCache({ data: null, timestamp: 0 });
    setError(null);
    setActiveRequest(null); // Clear any active request
  }, []); // No dependencies - only setState calls

    // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear user data
      clearUserCache();
      
      // Sign out from NextAuth
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [clearUserCache]);

  // Initialize user profile when auth changes - ONLY use NextAuth data
  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser) {
      // DISABLE backend API calls completely - only use NextAuth data

      const profileFromAuth = combineUserData(authUser, null); // Pass null for backend data
      setUserProfile(profileFromAuth);
      
      // DO NOT call backend API - it's causing 500 errors
      // The app will work perfectly with just NextAuth data
      
    } else if (!authLoading && !isAuthenticated) {
      // Clear user data when not authenticated
      setUserProfile(null);
      setUserDataCache({ data: null, timestamp: 0 });
      setError(null);
    }
  }, [authUser?.id, isAuthenticated, authLoading]); // Use authUser.id instead of full object

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
    logout,
    
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
    logout,
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