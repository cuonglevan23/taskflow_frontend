"use client";

import { useState, useCallback, useMemo } from "react";
import {
  User,
  AuthContextValue,
  LoginFormData,
  Permission,
  UserRole,
} from "@/types";

export function useAuth(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = useMemo(() => user !== null, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email,
        role: UserRole.OWNER,
        permissions: [Permission.CREATE_PROJECT, Permission.CREATE_TASK],
        avatar: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock logout - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Mock update - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (error) {
        console.error("Update user error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      return user?.permissions.includes(permission) ?? false;
    },
    [user]
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;

      if (Array.isArray(role)) {
        return role.includes(user.role);
      }

      return user.role === role;
    },
    [user]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkPermission,
    hasRole,
  };
}
