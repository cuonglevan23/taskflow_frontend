"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "./SessionContext"; // Session provider chung
import { GlobalDataProvider } from "./GlobalDataContext"; // Global data với cache
import { UserProvider } from "./UserContext";
import { ProjectsProvider } from "./ProjectsContext";
import { TasksProvider } from "./TasksContext";
import { NotificationProvider } from "./NotificationContext";

// Global App Provider - Senior Product Code
interface AppProviderProps {
  children: ReactNode;
}

/**
 * Global App Provider that wraps all context providers
 * OPTIMIZED HIERARCHY:
 * 1. SessionProvider - SINGLE source of truth cho session
 * 2. GlobalDataProvider - Cache global data với SWR
 * 3. Các provider khác sử dụng data từ global cache
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <SessionProvider>
      <GlobalDataProvider>
        <UserProvider>
          <NotificationProvider>
            <ProjectsProvider>
              <TasksProvider>
                {children}
              </TasksProvider>
            </ProjectsProvider>
          </NotificationProvider>
        </UserProvider>
      </GlobalDataProvider>
    </SessionProvider>
  );
};

export default AppProvider;