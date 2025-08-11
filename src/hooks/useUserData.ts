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
      
      // Check if we're in development and backend is not available
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
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
      const response = await api.patch<User>('/users/profile', updates);
      setUser(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
      throw err;
    }
  }, []);

  const updateAvatar = useCallback(async (avatarFile: File) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await api.post<{ avatarUrl: string }>('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update user with new avatar URL
      if (user) {
        const updatedUser = { ...user, avatar: response.data.avatarUrl };
        setUser(updatedUser);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update avatar');
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
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Failed to fetch users:', err);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, isLoading, error };
};