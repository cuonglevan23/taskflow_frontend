"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { UserRole, Permission, ROLE_PERMISSIONS } from "@/constants/auth";

interface User {
  id: string;
  role: UserRole;
  permissions: Permission[];
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated (from cookies, localStorage, etc.)
      const token = getCookie("token");
      const userRole = getCookie("userRole") as UserRole;
      const userId = getCookie("userId");
      const userName = getCookie("userName");
      const userEmail = getCookie("userEmail");

      if (token && userRole && userId && userName && userEmail) {
        const userData: User = {
          id: userId,
          role: userRole,
          permissions: ROLE_PERMISSIONS[userRole] || [],
          name: userName,
          email: userEmail,
        };
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // Simulate API call - replace with actual authentication
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      // Set cookies
      setCookie("token", data.token);
      setCookie("userRole", data.user.role);
      setCookie("userId", data.user.id);
      setCookie("userName", data.user.name);
      setCookie("userEmail", data.user.email);

      const userData: User = {
        id: data.user.id,
        role: data.user.role,
        permissions: ROLE_PERMISSIONS[data.user.role as UserRole] || [],
        name: data.user.name,
        email: data.user.email,
      };

      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear cookies
    deleteCookie("token");
    deleteCookie("userRole");
    deleteCookie("userId");
    deleteCookie("userName");
    deleteCookie("userEmail");

    setUser(null);

    // Redirect to login page
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    await checkAuthState();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Cookie helper functions
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;

  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${
    value || ""
  }${expires}; path=/; SameSite=Strict; Secure`;
}

function deleteCookie(name: string) {
  setCookie(name, "", -1);
}
