"use client";

import React, { ReactNode } from "react";
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
 * This ensures data synchronization across all components
 * including sidebar, home cards, and other parts of the app
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <UserProvider>
      <NotificationProvider>
        <ProjectsProvider>
          <TasksProvider>
            {children}
          </TasksProvider>
        </ProjectsProvider>
      </NotificationProvider>
    </UserProvider>
  );
};

export default AppProvider;