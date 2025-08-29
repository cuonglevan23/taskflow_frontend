"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider'; // Sử dụng AuthProvider mới thay vì SessionContext

import { SWRConfig, mutate } from 'swr';
import { projectsService } from '@/services/projects/projectService';
import { teamsService } from '@/services/teams/teamsService';
import { tasksService } from '@/services/tasks/tasksService';

interface GlobalData {
  user: any;
  teams: any[];
  projects: any[];
  taskStats: any;
  tasksSummary: any[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

interface GlobalDataContextType extends GlobalData {
  refetchAll: () => Promise<void>;
  addTeam: (newTeam: any) => void;
  addProject: (newProject: any) => void;
  addTask: (newTask: any) => void;
  updateTeam: (teamId: number, updatedTeam: any) => void;
  updateProject: (projectId: number, updatedProject: any) => void;
  updateTask: (taskId: number, updatedTask: any) => void;
}

const GlobalDataContext = createContext<GlobalDataContextType | null>(null);

interface GlobalDataProviderProps {
  children: React.ReactNode;
}

export function GlobalDataProvider({ children }: GlobalDataProviderProps) {
  const { user, isAuthenticated, isLoading } = useAuth(); // Sử dụng AuthProvider mới
  const [globalData, setGlobalData] = React.useState<GlobalData>({
    user: null,
    teams: [],
    projects: [],
    taskStats: null,
    tasksSummary: [],
    isLoaded: false,
    isLoading: false,
    error: null,
  });

  // Prefetch all critical data once on login
  const prefetchAllData = async () => {
    if (!user) return;

    setGlobalData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch all critical data in parallel
      const [teamsResponse, projectsResponse, taskStatsResponse, tasksSummaryResponse] = await Promise.all([
        teamsService.getMyTeams(),
        projectsService.getMyProjects(),
        tasksService.getMyTasksStats(),
        tasksService.getMyTasksSummary({
          page: 0,
          size: 1000,
          sortBy: 'startDate',
          sortDir: 'desc'
        })
      ]);

      const newGlobalData = {
        user: user,
        teams: teamsResponse || [],
        projects: projectsResponse?.projects || [],
        taskStats: taskStatsResponse,
        tasksSummary: tasksSummaryResponse?.tasks || [],
        isLoaded: true,
        isLoading: false,
        error: null,
      };

      setGlobalData(newGlobalData);

      // Populate SWR cache with prefetched data using correct cache keys
      await Promise.all([
        mutate(['teams', 'my-teams'], teamsResponse),
        mutate(['projects', 'my-projects'], projectsResponse),
        mutate(['tasks', 'my-tasks', 'stats'], taskStatsResponse),
        mutate(['tasks', 'my-tasks', 'summary', {
          page: 0,
          size: 1000,
          sortBy: 'startDate',
          sortDir: 'desc'
        }], tasksSummaryResponse),
      ]);

    } catch (error) {
      console.error('Failed to prefetch global data:', error);
      setGlobalData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  };

  const refetchAll = async () => {
    await prefetchAllData();
  };

  // Optimistic updates for mutations
  const addTeam = (newTeam: any) => {
    setGlobalData(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam]
    }));
  };

  const addProject = (newProject: any) => {
    setGlobalData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const addTask = (newTask: any) => {
    setGlobalData(prev => ({
      ...prev,
      tasksSummary: [newTask, ...prev.tasksSummary] // Add to beginning for consistency
    }));
    
    // Also update SWR cache immediately
    mutate(['tasks', 'my-tasks', 'summary', {
      page: 0,
      size: 1000,
      sortBy: 'startDate',
      sortDir: 'desc'
    }], (currentData: any) => {
      if (currentData?.tasks) {
        return {
          ...currentData,
          tasks: [newTask, ...currentData.tasks]
        };
      }
      return { tasks: [newTask] };
    }, false);
  };

  const updateTeam = (teamId: number, updatedTeam: any) => {
    setGlobalData(prev => ({
      ...prev,
      teams: prev.teams.map(team => 
        team.id === teamId ? { ...team, ...updatedTeam } : team
      )
    }));
  };

  const updateProject = (projectId: number, updatedProject: any) => {
    setGlobalData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === projectId ? { ...project, ...updatedProject } : project
      )
    }));
  };

  const updateTask = (taskId: number, updatedTask: any) => {

    
    setGlobalData(prev => {
      const updatedTasksSummary = prev.tasksSummary.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      );
      
      console.log('📊 GlobalData: Before update tasks count:', prev.tasksSummary.length);
      console.log('📊 GlobalData: After update tasks count:', updatedTasksSummary.length);
      
      return {
        ...prev,
        tasksSummary: updatedTasksSummary
      };
    });
    
    // Also update SWR cache immediately
    mutate(['tasks', 'my-tasks', 'summary', {
      page: 0,
      size: 1000,
      sortBy: 'startDate',
      sortDir: 'desc'
    }], (currentData: any) => {
      if (currentData?.tasks) {
        return {
          ...currentData,
          tasks: currentData.tasks.map((task: any) => 
            task.id === taskId ? { ...task, ...updatedTask } : task
          )
        };
      }
      return currentData;
    }, false);
  };

  // Prefetch data when session is available
  React.useEffect(() => {
    if (user && !globalData.isLoaded && !globalData.isLoading) {
      prefetchAllData();
    }
  }, [user, globalData.isLoaded, globalData.isLoading]);

  const contextValue: GlobalDataContextType = {
    ...globalData,
    refetchAll,
    addTeam,
    addProject,
    addTask,
    updateTeam,
    updateProject,
    updateTask,
  };

  // Provide SWR fallback data to prevent initial API calls using correct array keys
  const swrFallback = globalData.isLoaded ? {
    [`${JSON.stringify(['teams', 'my-teams'])}`]: globalData.teams,
    [`${JSON.stringify(['projects', 'my-projects'])}`]: { projects: globalData.projects },
    [`${JSON.stringify(['tasks', 'my-tasks', 'stats'])}`]: globalData.taskStats,
    [`${JSON.stringify(['tasks', 'my-tasks', 'summary', {
      page: 0,
      size: 1000,
      sortBy: 'startDate',
      sortDir: 'desc'
    }])}`]: { tasks: globalData.tasksSummary },
  } : {};

  return (
    <GlobalDataContext.Provider value={contextValue}>
      <SWRConfig value={{ fallback: swrFallback }}>
        {children}
      </SWRConfig>
    </GlobalDataContext.Provider>
  );
}

export const useGlobalData = (): GlobalDataContextType => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
};