"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import type { User } from '@/types/auth';

export interface UseUserDataReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateAvatar: (avatarFile: File) => Promise<void>;
}

export interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: string) => User[];
}

/**
 * Hook for managing current user data
 */
export const useUserData = (): UseUserDataReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call NextJS API route directly (not through backend API)
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user data';
      
      // Handle network errors gracefully - don't set error state for network issues
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error' || !err.response) {
        // Don't set error state for network issues, just use fallback
        setError(null);
        setUser(null); // Let the layout use auth data as fallback
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      setError(null);
      // This should call backend API for user updates
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    }
  }, []);

  const updateAvatar = useCallback(async (avatarFile: File) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }
      
      const result = await response.json();
      
      // Update user with new avatar URL
      if (user) {
        const updatedUser = { ...user, avatar: result.avatarUrl };
        setUser(updatedUser);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update avatar');
      throw err;
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
    updateUser,
    updateAvatar,
  };
};

/**
 * Hook for managing multiple users data
 */
export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // This can still use backend API for fetching multiple users
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Failed to fetch users:', err);
      // Fallback to empty array instead of crashing
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  const getUsersByRole = useCallback((role: string): User[] => {
    return users.filter(user => user.role === role);
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    getUserById,
    getUsersByRole,
  };
};

/**
 * Hook for fetching a specific user by ID
 */
export const useUser = (userId: string | null): { user: User | null; isLoading: boolean; error: string | null } => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<User>(`/users/${userId}`);
        setUser(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch user');
        console.error('Failed to fetch user:', err);
        // Fallback to null instead of crashing
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, isLoading, error };
};