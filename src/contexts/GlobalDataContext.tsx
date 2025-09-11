"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SWRConfig, mutate } from 'swr';
import { projectsService } from '@/services/projects/projectService';
import { teamsService } from '@/services/teams/teamsService';
import { tasksService } from '@/services/tasks/tasksService';
import PostsService from '@/services/post/PostsService';

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
        PostsService.getNewsfeed(0, 20) // Load recent posts
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

      // Populate SWR cache with prefetched data using proper URL-based keys
      await Promise.all([
        mutate('/api/teams/my-teams', teamsResponse),
        mutate('/api/projects/my-projects', projectsResponse),
        mutate('/api/tasks/my-tasks/stats', taskStatsResponse),
        mutate('/api/tasks/my-tasks/summary?page=0&size=1000&sortBy=startDate&sortDir=desc', tasksSummaryResponse),
        mutate('/api/posts/feed?page=0&size=20', postsResponse),
        mutate(`/api/posts/user/${user.id}?page=0&size=20`, await PostsService.getUserPosts(user.id, 0, 20))
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

  const addPost = async (newPost: any) => {
    try {
      // Create post via API first
      const response = await PostsService.createPost(newPost);

      if (response.success && response.data) {
        // Add to local state immediately for optimistic update
        setGlobalData(prev => ({
          ...prev,
          posts: [response.data, ...prev.posts]
        }));

        // Simple cache invalidation - back to original approach
        await mutate(
          key => Array.isArray(key) && key[0] === 'posts',
          undefined,
          { revalidate: true }
        );

        return response.data;
      }
      throw new Error('Failed to create post');
    } catch (error) {
      console.error('Error creating post in GlobalData:', error);
      throw error;
    }
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

    // Force revalidate all posts-related SWR caches using proper URL-based keys
    Promise.all([
      mutate(
        key => typeof key === 'string' && key.includes('/api/posts/feed'),
        undefined,
        { revalidate: true }
      ),
      mutate(
        key => typeof key === 'string' && key.includes('/api/posts/user/'),
        undefined,
        { revalidate: true }
      ),
      mutate(
        key => typeof key === 'string' && key.startsWith('/api/posts/') && !key.includes('feed') && !key.includes('user'),
        undefined,
        { revalidate: true }
      )
    ]);
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
