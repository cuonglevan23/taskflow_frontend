// SWR Hooks for Projects - Data fetching with caching and revalidation
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { projectsService } from '@/services/projects';
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
  status?: string[];
  priority?: string[];
}) => {
  return useSWR(
    projectKeys.myProjects(),
    () => projectsService.getMyProjects(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
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

// Create project mutation
export const useCreateProject = () => {
  return useSWRMutation(
    projectKeys.lists(),
    async (key, { arg }: { arg: CreateProjectDTO }) => {
      const newProject = await projectsService.createProject(arg);
      
      // Mutate related caches
      return newProject;
    },
    {
      populateCache: (newProject: Project, currentData) => {
        // Add new project to existing list if available
        if (currentData && 'projects' in currentData) {
          return {
            ...currentData,
            projects: [newProject, ...currentData.projects],
            totalElements: currentData.totalElements + 1,
          };
        }
        return newProject;
      },
      revalidate: true,
    }
  );
};

// Update project mutation
export const useUpdateProject = () => {
  return useSWRMutation(
    projectKeys.all,
    async (key, { arg }: { arg: { id: number; data: UpdateProjectDTO } }) => {
      const { id, data } = arg;
      const updatedProject = await projectsService.updateProject(id, data);
      
      return { id, project: updatedProject };
    },
    {
      populateCache: ({ id, project }, currentData) => {
        // Update project in list cache
        if (currentData && 'projects' in currentData) {
          return {
            ...currentData,
            projects: currentData.projects.map((p: Project) => 
              p.id === id ? project : p
            ),
          };
        }
        return project;
      },
      revalidate: false, // Don't revalidate since we're updating optimistically
    }
  );
};

// Delete project mutation
export const useDeleteProject = () => {
  return useSWRMutation(
    projectKeys.all,
    async (key, { arg }: { arg: number }) => {
      await projectsService.deleteProject(arg);
      return arg;
    },
    {
      populateCache: (deletedId: number, currentData) => {
        // Remove project from list cache
        if (currentData && 'projects' in currentData) {
          return {
            ...currentData,
            projects: currentData.projects.filter((p: Project) => p.id !== deletedId),
            totalElements: currentData.totalElements - 1,
          };
        }
        return currentData;
      },
      revalidate: true,
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
      populateCache: ({ id, project }, currentData) => {
        if (currentData && 'projects' in currentData) {
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