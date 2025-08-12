"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Clean TypeScript interfaces for UI state only
interface TasksContextType {
  // UI state - NOT data
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  
  // View preferences
  calendarView: 'dayGridMonth' | 'dayGridWeek';
  setCalendarView: (view: 'dayGridMonth' | 'dayGridWeek') => void;
  
  // UI filters (not data filters)
  activeFilters: {
    status?: string[];
    priority?: string[];
    assignee?: string;
  };
  setActiveFilters: (filters: TasksContextType['activeFilters']) => void;
  
  // Global filters and sort for component compatibility
  globalFilters: {
    status?: string[];
    priority?: string[];
    assignee?: string;
  };
  setGlobalFilters: (filters: TasksContextType['globalFilters']) => void;
  
  globalSort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  setGlobalSort: (sort: TasksContextType['globalSort']) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  // UI state only - NO data fetching here
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'dayGridWeek'>('dayGridMonth');
  const [activeFilters, setActiveFilters] = useState<TasksContextType['activeFilters']>({});
  
  // Global filters and sort state for component compatibility
  const [globalFilters, setGlobalFilters] = useState<TasksContextType['globalFilters']>({});
  const [globalSort, setGlobalSort] = useState<TasksContextType['globalSort']>({
    field: 'startDate',
    direction: 'desc'
  });

  const contextValue: TasksContextType = {
    selectedTaskId,
    setSelectedTaskId,
    calendarView,
    setCalendarView,
    activeFilters,
    setActiveFilters,
    globalFilters,
    setGlobalFilters,
    globalSort,
    setGlobalSort,
  };

  return (
    <TasksContext.Provider value={contextValue}>
      {children}
    </TasksContext.Provider>
  );
};

// Custom hook to use the context
export const useTasksContext = (): TasksContextType => {
  const context = useContext(TasksContext);
  
  if (context === undefined) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  
  return context;
};