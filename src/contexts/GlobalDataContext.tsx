"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SWRConfig, mutate } from 'swr';
import { projectsService } from '@/services/projects/projectService';
import { teamsService } from '@/services/teams/teamsService';
import { tasksService } from '@/services/tasks/tasksService';
import postsService from '@/services/postsService';

interface GlobalData {
  user: any;
  teams: any[];
  projects: any[];
  taskStats: any;
  tasksSummary: any[];
  posts: any[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

interface GlobalDataContextType extends GlobalData {
  refetchAll: () => Promise<void>;
  addTeam: (newTeam: any) => void;
  addProject: (newProject: any) => void;
  addTask: (newTask: any) => void;
  addPost: (newPost: any) => void;
  updateTeam: (teamId: number, updatedTeam: any) => void;
  updateProject: (projectId: number, updatedProject: any) => void;
  updateTask: (taskId: number, updatedTask: any) => void;
  updatePost: (postId: number, updatedPost: any) => void;
  invalidatePostsCache: () => void;
}

const GlobalDataContext = createContext<GlobalDataContextType | null>(null);

interface GlobalDataProviderProps {
  children: React.ReactNode;
}

export function GlobalDataProvider({ children }: GlobalDataProviderProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [globalData, setGlobalData] = React.useState<GlobalData>({
    user: null,
    teams: [],
    projects: [],
    taskStats: null,
    tasksSummary: [],
    posts: [],
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
      const [teamsResponse, projectsResponse, taskStatsResponse, tasksSummaryResponse, postsResponse] = await Promise.all([
        teamsService.getMyTeams(),
        projectsService.getMyProjects(),
        tasksService.getMyTasksStats(),
        tasksService.getMyTasksSummary({
          page: 0,
          size: 1000,
          sortBy: 'startDate',
          sortDir: 'desc'
        }),
        postsService.getNewsfeed(0, 20) // Load recent posts
      ]);

      const newGlobalData = {
        user: user,
        teams: teamsResponse || [],
        projects: projectsResponse?.projects || [],
        taskStats: taskStatsResponse,
        tasksSummary: tasksSummaryResponse?.tasks || [],
        posts: postsResponse?.data || [],
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
        mutate(['posts', 'feed', 0], postsResponse),
        mutate(['posts', 'user', user.id, 0], await postsService.getUserPosts(user.id, 0, 20))
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
      tasksSummary: [newTask, ...prev.tasksSummary]
    }));
  };

  const addPost = (newPost: any) => {
    setGlobalData(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts]
    }));
    
    // Also update SWR cache immediately
    mutate(
      key => Array.isArray(key) && key[0] === 'posts',
      undefined,
      { revalidate: true }
    );
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
    setGlobalData(prev => ({
      ...prev,
      tasksSummary: prev.tasksSummary.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      )
    }));
  };

  const updatePost = (postId: number, updatedPost: any) => {
    setGlobalData(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
        post.id === postId ? { ...post, ...updatedPost } : post
      )
    }));
  };

  const invalidatePostsCache = () => {
    console.log('🔄 Invalidating all posts cache from GlobalDataContext...');

    // Force revalidate all posts-related SWR caches
    mutate(
      key => Array.isArray(key) && key[0] === 'posts',
      undefined,
      { revalidate: true }
    );
  };

  // Effect to sync user changes and prefetch data
  React.useEffect(() => {
    if (isAuthenticated && user && !globalData.isLoaded) {
      prefetchAllData();
    }
  }, [isAuthenticated, user, globalData.isLoaded]);

  const value: GlobalDataContextType = {
    ...globalData,
    refetchAll,
    addTeam,
    addProject,
    addTask,
    addPost,
    updateTeam,
    updateProject,
    updateTask,
    updatePost,
    invalidatePostsCache,
  };

  return (
    <GlobalDataContext.Provider value={value}>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          refreshInterval: 0,
          dedupingInterval: 2000,
          errorRetryCount: 3,
          errorRetryInterval: 5000,
          revalidateIfStale: true,
          focusThrottleInterval: 5000,
          onError: (error, key) => {
            console.error('SWR Error:', error, 'Key:', key);
          },
          onSuccess: (data, key) => {
            console.log('🔄 SWR Cache Updated:', key);
          }
        }}
      >
        {children}
      </SWRConfig>
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}
