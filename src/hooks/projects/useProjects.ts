import React, { useState } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { projectsService } from '@/services/projects';
import { toast } from 'react-hot-toast';
import type { ProjectStatus, ProjectPriority } from '@/types/project';
import type {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectQueryParams,
  ProjectStats,
  ProjectProgress,
  ProjectTasksResponse
} from '@/types/project';

// Key generators for SWR caching
const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: ProjectQueryParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
  stats: () => [...projectKeys.all, 'stats'] as const,
  myProjects: () => [...projectKeys.all, 'my-projects'] as const,
  teamProjects: (teamId: number) => [...projectKeys.all, 'team', teamId] as const,
  projectTasks: (id: number) => [...projectKeys.detail(id), 'tasks'] as const,
  projectProgress: (id: number) => [...projectKeys.detail(id), 'progress'] as const,
} as const;

// Get single project by ID
export const useProject = (id: number | null) => {
  return useSWR(
    id ? projectKeys.detail(id) : null,
    () => id ? projectsService.getProject(id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );
};

// Get projects with pagination and filters
export const useProjects = (params?: ProjectQueryParams) => {
  return useSWR(
    projectKeys.list(params),
    () => projectsService.getProjects(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      errorRetryCount: 3,
    }
  );
};

// Get my projects (current user)
export const useMyProjects = (params?: {
  page?: number;
  size?: number;
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
}) => {
  const key = React.useMemo(() =>
    projectKeys.list(params),
    [params?.page, params?.size, params?.status, params?.priority]
  );

  return useSWR(
    key,
    () => projectsService.getMyProjects(params).then(data =>
      Array.isArray(data) ? data : data?.projects || []
    ),
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );
};

// Get team projects with optimized caching
export const useTeamProjects = (teamId: number | null, params?: {
  page?: number;
  size?: number;
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
}) => {
  return useSWR(
    teamId ? projectKeys.teamProjects(teamId) : null,
    () => teamId ? projectsService.getTeamProjects(teamId, params) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );
};

// Get project statistics
export const useProjectStats = (organizationId?: number) => {
  return useSWR(
    projectKeys.stats(),
    () => projectsService.getProjectStats(organizationId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
      errorRetryCount: 2,
    }
  );
};

// Get project tasks
export const useProjectTasks = (projectId: number | null) => {
  return useSWR(
    projectId ? projectKeys.projectTasks(projectId) : null,
    () => projectId ? projectsService.getProjectTasks(projectId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );
};

// Get project progress details
export const useProjectProgress = (projectId: number | null) => {
  return useSWR(
    projectId ? projectKeys.projectProgress(projectId) : null,
    () => projectId ? projectsService.getProjectProgress(projectId) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute for real-time progress tracking
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      dedupingInterval: 30000, // Avoid duplicate requests within 30 seconds
    }
  );
};

// Create project mutation with optimistic updates
export const useCreateProject = () => {
  return useSWRMutation(
    projectKeys.myProjects(),
    async (key, { arg }: { arg: CreateProjectDTO }) => {
      const newProject = await projectsService.createProject(arg);

      // Update global cache optimistically
      // No global mutations needed - SWR handles cache updates automatically
      // addProject will be called from component level

      return newProject;
    },
    {
      populateCache: (newProject: Project, currentData: any) => {
        if (currentData && 'projects' in currentData && Array.isArray(currentData.projects)) {
          return {
            ...currentData,
            projects: [newProject, ...currentData.projects],
            totalElements: (currentData.totalElements || currentData.projects.length) + 1,
          };
        }
        return newProject;
      },
      revalidate: false, // No need to revalidate since we update optimistically
    }
  );
};

// Update project mutation using SWR
export const useUpdateProject = () => {
  return useSWRMutation(
    projectKeys.all,
    async (key, { arg }: { arg: { id: number; data: UpdateProjectDTO } }) => {
      const { id, data } = arg;
      console.log(`🔄 Hook: Starting update for project ${id}`, data);
      const updatedProject = await projectsService.updateProject(id, data);
      console.log(`✅ Hook: Successfully updated project ${id}`);
      return { id, project: updatedProject };
    },
    {
      populateCache: ({ id, project }: { id: number; project: Project }, currentData: any) => {
        // Update project in list cache optimistically
        if (currentData && 'projects' in currentData && Array.isArray(currentData.projects)) {
          return {
            ...currentData,
            projects: currentData.projects.map((p: Project) =>
              p.id === id ? project : p
            ),
          };
        }
        return project;
      },
      revalidate: true, // Revalidate to ensure data consistency
      onSuccess: ({ id, project }: { id: number; project: Project }) => {
        console.log(`🎉 Successfully updated project ${id}`);
        toast.success('Project updated successfully');

        // Update individual project cache
        mutate(projectKeys.detail(id), project, false);

        // Revalidate related caches
        mutate(projectKeys.myProjects(), undefined, true);
        mutate(projectKeys.list(), undefined, true);
      },
      onError: (error: any) => {
        console.error('❌ Update project failed:', error);
        const errorMessage = error?.message || 'Failed to update project';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  );
};

// Delete project mutation with enhanced error handling and optimistic updates
export const useDeleteProject = () => {
  return useSWRMutation(
    projectKeys.all,
    async (key, { arg }: { arg: number }) => {
      console.log(`🗑️ Hook: Starting delete for project ${arg}`);
      await projectsService.deleteProject(arg);
      console.log(`✅ Hook: Successfully deleted project ${arg}`);
      return arg;
    },
    {
      populateCache: (deletedId: number, currentData: any) => {
        // Remove project from list cache optimistically
        if (currentData && 'projects' in currentData && Array.isArray(currentData.projects)) {
          const updatedProjects = currentData.projects.filter((p: Project) => p.id !== deletedId);
          return {
            ...currentData,
            projects: updatedProjects,
            totalElements: Math.max((currentData.totalElements || currentData.projects.length) - 1, 0),
          };
        }
        return currentData;
      },
      revalidate: true, // Revalidate to ensure data consistency
      onSuccess: (deletedId: number) => {
        console.log(`🎉 Successfully deleted project ${deletedId}`);
        // Clear individual project cache
        mutate(projectKeys.detail(deletedId), undefined, false);
      },
      onError: (error: any) => {
        console.error('❌ Delete project failed:', error);
        // Show user-friendly error message
        throw new Error(error.message || 'Failed to delete project');
      }
    }
  );
};

// Bulk delete projects mutation
export const useBulkDeleteProjects = () => {
  return useSWRMutation(
    projectKeys.all,
    async (key, { arg }: { arg: number[] }) => {
      console.log(`🗑️ Hook: Starting bulk delete for projects`, arg);
      const result = await projectsService.deleteProjects(arg);
      console.log(`✅ Hook: Bulk delete completed`, result);
      return result;
    },
    {
      populateCache: (result: { success: number[]; failed: { id: number; error: string }[] }, currentData: any) => {
        // Remove successfully deleted projects from cache
        if (currentData && 'projects' in currentData && Array.isArray(currentData.projects)) {
          const updatedProjects = currentData.projects.filter((p: Project) =>
            !result.success.includes(p.id)
          );
          return {
            ...currentData,
            projects: updatedProjects,
            totalElements: Math.max((currentData.totalElements || currentData.projects.length) - result.success.length, 0),
          };
        }
        return currentData;
      },
      revalidate: true,
      onSuccess: (result) => {
        console.log(`🎉 Bulk delete completed: ${result.success.length} succeeded, ${result.failed.length} failed`);
        // Clear individual project caches for successfully deleted projects
        result.success.forEach(id => {
          mutate(projectKeys.detail(id), undefined, false);
        });
      }
    }
  );
};

// Update project status mutation
export const useUpdateProjectStatus = () => {
  return useSWRMutation(
    projectKeys.all,
    async (key, { arg }: { arg: { id: number; status: string } }) => {
      const { id, status } = arg;
      const updatedProject = await projectsService.updateProjectStatus(id, status as any);
      return { id, project: updatedProject };
    },
    {
      populateCache: ({ id, project }: { id: number; project: Project }, currentData: any) => {
        // Update project in list cache
        if (currentData && 'projects' in currentData && Array.isArray(currentData.projects)) {
          return {
            ...currentData,
            projects: currentData.projects.map((p: Project) =>
              p.id === id ? project : p
            ),
          };
        }
        return project;
      },
      revalidate: false,
    }
  );
};

// Search projects
export const useSearchProjects = (query: string, filters?: Partial<ProjectQueryParams>) => {
  return useSWR(
    query ? ['projects', 'search', query, filters] : null,
    () => query ? projectsService.searchProjects(query, filters) : [],
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
      errorRetryCount: 2,
    }
  );
};

// Helper to manually revalidate all project-related caches
export const revalidateProjects = async () => {
  const { mutate } = await import('swr');

  // Revalidate all project caches
  await mutate(
    (key) => Array.isArray(key) && key[0] === 'projects',
    undefined,
    { revalidate: true }
  );
};

// Helper to clear all project caches
export const clearProjectCaches = async () => {
  const { mutate } = await import('swr');

  // Clear all project caches
  await mutate(
    (key) => Array.isArray(key) && key[0] === 'projects',
    undefined,
    { revalidate: false }
  );
};

// Export cache keys for external use
export { projectKeys };
