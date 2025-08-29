"use client";

import React, { ReactNode } from "react";
// SessionProvider đã được loại bỏ - sử dụng AuthProvider thay thế
import { GlobalDataProvider } from "./GlobalDataContext"; // Global data với cache
// UserProvider đã deprecated - sử dụng AuthProvider thay thế
import { ProjectsProvider } from "./ProjectsContext";
import { TasksProvider } from "./TasksContext";
import { NotificationProvider } from "./NotificationContext";

// Global App Provider - Backend JWT Authentication Only
interface AppProviderProps {
  children: ReactNode;
}

/**
 * Global App Provider - Simplified after NextAuth.js removal
 * NEW HIERARCHY (Backend JWT Only):
 * 1. AuthProvider - Handled in layout.tsx (outside of AppProvider)
 * 2. GlobalDataProvider - Cache global data với SWR
 * 3. Các provider khác sử dụng data từ global cache
 *
 * MIGRATION NOTES:
 * - SessionProvider removed - authentication handled by AuthProvider in layout.tsx
 * - UserProvider deprecated - user data comes from AuthProvider
 * - Authentication flow simplified to backend-only JWT with HTTP-only cookies
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <GlobalDataProvider>
      <NotificationProvider>
        <ProjectsProvider>
          <TasksProvider>
            {children}
          </TasksProvider>
        </ProjectsProvider>
      </NotificationProvider>
    </GlobalDataProvider>
  );
};

export default AppProvider;