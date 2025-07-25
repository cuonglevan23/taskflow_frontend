"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { ThemeMode, Theme, getTheme, getCSSVariables } from "@/constants/theme";

// Theme Context
interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

// Theme Provider Component
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "taskmanagement-theme",
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as ThemeMode;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const initialTheme = storedTheme || systemTheme || defaultTheme;
    setMode(initialTheme);
    setMounted(true);
  }, [defaultTheme, storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const cssVariables = getCSSVariables(mode);

    // Remove previous theme classes
    root.classList.remove("light", "dark");

    // Add current theme class
    root.classList.add(mode);

    // Apply CSS variables
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Store in localStorage
    localStorage.setItem(storageKey, mode);
  }, [mode, mounted, storageKey]);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const theme = getTheme(mode);
  const isDark = mode === "dark";
  const isLight = mode === "light";

  const value: ThemeContextType = {
    mode,
    theme,
    toggleTheme,
    setTheme,
    isDark,
    isLight,
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

// Hook for theme-aware styling
export function useThemeStyles() {
  const { theme, mode } = useTheme();

  const getThemeClass = useCallback(
    (lightClass: string, darkClass: string): string => {
      return mode === "dark" ? darkClass : lightClass;
    },
    [mode]
  );

  const getThemeColor = useCallback(
    (lightColor: string, darkColor: string): string => {
      return mode === "dark" ? darkColor : lightColor;
    },
    [mode]
  );

  return {
    theme,
    mode,
    getThemeClass,
    getThemeColor,
  };
}

// Hook for component-specific theme styles
export function useComponentTheme<T extends Record<string, string | number>>(
  lightStyles: T,
  darkStyles: T
): T {
  const { mode } = useTheme();
  return mode === "dark" ? darkStyles : lightStyles;
}

// Export types
export type { ThemeContextType, ThemeProviderProps };
