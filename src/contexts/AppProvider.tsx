"use client";

import React, { ReactNode } from "react";
import { GlobalDataProvider } from "./GlobalDataContext";
import { ProjectsProvider } from "./ProjectsContext";
import { TasksProvider } from "./TasksContext";
import { NotificationProvider } from "./NotificationContext";

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Global App Provider - Simplified without authentication checks
 * Authentication is handled by dashboard layout, so we just provide contexts
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  // Always render all providers - authentication is handled elsewhere
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