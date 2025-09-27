"use client";

import React, { createContext, useContext, useEffect } from 'react';
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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

  // ✅ ADD: Track previous authentication state to detect changes
  const [prevUserId, setPrevUserId] = React.useState<string | null>(null);

  // Prefetch all critical data once on login
  const prefetchAllData = async () => {
    // ✅ ADD: Skip if not authenticated
    if (!user || !isAuthenticated) {
      setGlobalData(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: false,
        error: null,
        user: null,
        teams: [],
        projects: [],
        taskStats: null,
        tasksSummary: [],
        posts: []
      }));
      return;
    }

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
        PostsService.getNewsfeed(0, 20)
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

      // Populate SWR cache with prefetched data
      await Promise.all([
        mutate('/api/teams/my-teams', teamsResponse),
        mutate('/api/projects/my-projects', projectsResponse),
        mutate('/api/tasks/my-tasks/stats', taskStatsResponse),
        mutate('/api/tasks/my-tasks/summary?page=0&size=1000&sortBy=startDate&sortDir=desc', tasksSummaryResponse),
        mutate('/api/posts/feed?page=0&size=20', postsResponse),
        mutate(`/api/posts/user/${user.id}?page=0&size=20`, await PostsService.getUserPosts(Number(user.id), 0, 20))
      ]);
    } catch (error) {
      setGlobalData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  };

  // ✅ CRITICAL FIX: Improved effect to handle authentication state changes
  useEffect(() => {
    if (authLoading) {
      // Still loading authentication state
      return;
    }

    if (isAuthenticated && user) {
      const currentUserId = user.id;

      // Check if this is a new user login or data hasn't been loaded for current user
      if (currentUserId !== prevUserId || !globalData.isLoaded || globalData.user?.id !== currentUserId) {
        setPrevUserId(currentUserId);
        prefetchAllData();
      }
    } else if (!isAuthenticated) {
      // User logged out - clear data
      setPrevUserId(null);
      setGlobalData({
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
    }
  }, [isAuthenticated, user?.id, authLoading]);

  const refetchAll = async () => {
    if (!isAuthenticated || !user) {
      return;
    }
    await prefetchAllData();
  };

  // Optimistic updates for mutations
  const addTeam = (newTeam: any) => {
    if (!isAuthenticated) return;
    setGlobalData(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam]
    }));
  };

  const addProject = (newProject: any) => {
    if (!isAuthenticated) return;
    setGlobalData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const addTask = (newTask: any) => {
    if (!isAuthenticated) return;
    setGlobalData(prev => ({
      ...prev,
      tasksSummary: [newTask, ...prev.tasksSummary]
    }));
  };

  const addPost = async (newPost: any) => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    try {
      // Create post via API first
      const response = await PostsService.createPost(newPost);

      if (response.success && response.data) {
        // Add to local state immediately for optimistic update
        setGlobalData(prev => ({
          ...prev,
          posts: [response.data, ...prev.posts]
        }));

        // Invalidate all posts-related SWR caches with correct keys
        await Promise.all([
          // Invalidate newsfeed
          mutate(
            key => typeof key === 'string' && key.includes('/api/posts/feed'),
            undefined,
            { revalidate: true }
          ),
          // Invalidate user posts
          mutate(
            key => typeof key === 'string' && key.includes(`/api/posts/user/${user.id}`),
            undefined,
            { revalidate: true }
          ),
          // Invalidate posts array keys (for profile components)
          mutate(
            key => Array.isArray(key) && key[0] === 'posts',
            undefined,
            { revalidate: true }
          )
        ]);

        return response.data;
      }

      throw new Error('Failed to create post - no data returned');
    } catch (error) {
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

  // SWR Configuration with authentication-aware error handling
  const swrConfig = {
    onError: (error: any, key: string) => {
      // Don't log authentication errors as they are expected when not logged in
      if (!error.message?.includes('Unauthorized') && !error.message?.includes('401')) {
        // Only log non-authentication errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('SWR Error:', error, 'Key:', key);
        }
      }
    },
    // Only revalidate if user is authenticated
    revalidateOnFocus: isAuthenticated,
    revalidateOnReconnect: isAuthenticated,
    shouldRetryOnError: (error: any) => {
      // Don't retry on authentication errors
      return !error.message?.includes('Unauthorized') && !error.message?.includes('401');
    }
  };

  const contextValue: GlobalDataContextType = {
    ...globalData,
    refetchAll,
    addTeam,
    addProject,
    addTask,
    addPost, // Use the actual function, not a stub
    updateTeam,
    updateProject,
    updateTask,
    updatePost,
    invalidatePostsCache,
  };

  return (
    <GlobalDataContext.Provider value={contextValue}>
      <SWRConfig value={swrConfig}>
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
