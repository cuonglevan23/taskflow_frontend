"use client";

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useTaskManagement, TaskManagementState, TaskManagementActions } from '../hooks/useTaskManagement';
import { SAMPLE_TASKS } from '../list/hooks/sampleData';

// Create context type
type TaskManagementContextType = TaskManagementState & TaskManagementActions & {
  tasksByStatus: Record<string, any[]>;
  tasksByAssignmentDate: Record<string, any[]>;
  // Calendar view state
  calendarView: 'dayGridMonth' | 'dayGridWeek';
  setCalendarView: (view: 'dayGridMonth' | 'dayGridWeek') => void;
};

// Create context
const TaskManagementContext = createContext<TaskManagementContextType | undefined>(undefined);

// Provider component
interface TaskManagementProviderProps {
  children: ReactNode;
}

export const TaskManagementProvider: React.FC<TaskManagementProviderProps> = ({ children }) => {
  // Initialize shared task management once at provider level
  const taskManagement = useTaskManagement(SAMPLE_TASKS);
  
  // Calendar view state
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'dayGridWeek'>('dayGridMonth');

  const contextValue = {
    ...taskManagement,
    calendarView,
    setCalendarView,
  };

  return (
    <TaskManagementContext.Provider value={contextValue}>
      {children}
    </TaskManagementContext.Provider>
  );
};

// Custom hook to use the context
export const useTaskManagementContext = (): TaskManagementContextType => {
  const context = useContext(TaskManagementContext);
  
  if (context === undefined) {
    throw new Error('useTaskManagementContext must be used within a TaskManagementProvider');
  }
  
  return context;
};