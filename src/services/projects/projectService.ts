// Project Service - Centralized project operations using BaseApiClient
import { BaseApiClient } from '@/lib/baseApiClient';
import {
  safeParseDate,
  formatDateString,
  calculateDaysBetween,
  isDateOverdue
} from '@/lib/transforms';
import type {
  Project,
  BackendProject,
  ProjectStatus,
  ProjectPriority,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectFormData,
  ProjectSummary,
  ProjectQueryParams,
  ProjectStats,
  ProjectProgress,
  ProjectTasksResponse,
  PaginatedProjectsResponse,
  UserProjectsResponse,
  TeamProjectsResponse
} from '@/types/project';

// Project status color mappings
const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNED: 'blue',
  IN_PROGRESS: 'orange',
  COMPLETED: 'green',
  ON_HOLD: 'yellow',
  CANCELLED: 'red',
} as const;

// Project priority color mappings
const PROJECT_PRIORITY_COLORS: Record<ProjectPriority, string> = {
  LOW: 'green',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
} as const;


// Transform backend project to frontend format
export const transformBackendProject = (backendProject: BackendProject): Project => {
  const startDate = safeParseDate(backendProject.startDate);
  const endDate = safeParseDate(backendProject.endDate);
  const createdAt = safeParseDate(backendProject.createdAt);
  const updatedAt = safeParseDate(backendProject.updatedAt);
  
  // Calculate computed fields
  const duration = calculateDaysBetween(startDate, endDate);
  const daysRemaining = calculateDaysBetween(new Date(), endDate);
  const isOverdue = isDateOverdue(endDate);
  
  // Calculate progress based on completed/total tasks
  const progress = backendProject.taskCount && backendProject.taskCount > 0 
    ? Math.round(((backendProject.completedTaskCount || 0) / backendProject.taskCount) * 100)
    : 0;

  // Status and priority colors with proper type safety
  const statusColor = PROJECT_STATUS_COLORS[backendProject.status] || 'gray';
  const priorityColor = PROJECT_PRIORITY_COLORS[backendProject.priority || 'MEDIUM'] || 'blue';
  
  // Progress color based on completion percentage
  const progressColor = progress >= 80 ? 'green' : progress >= 50 ? 'yellow' : progress >= 20 ? 'orange' : 'red';

  return {
    id: backendProject.id,
    name: backendProject.name,
    description: backendProject.description || '',
    status: backendProject.status,
    priority: backendProject.priority || 'MEDIUM',
    startDate,
    endDate,
    startDateString: formatDateString(backendProject.startDate),
    endDateString: formatDateString(backendProject.endDate),
    ownerId: backendProject.ownerId,
    createdById: backendProject.createdById, // Now properly typed as optional
    emailPm: backendProject.emailPm, // Now properly typed as optional
    organizationId: backendProject.organizationId || undefined, // Handle null/undefined properly
    createdAt,
    updatedAt,
    
    // User role and permissions - now properly typed as optional
    currentUserRole: backendProject.currentUserRole,
    isCurrentUserMember: backendProject.isCurrentUserMember,

    // Computed fields
    duration,
    isOverdue,
    daysRemaining,
    progress,
    
    // Additional fields with defaults
    budget: backendProject.budget,
    actualBudget: backendProject.actualBudget,
    teamIds: backendProject.teamIds || [],
    memberCount: backendProject.memberCount || 0,
    taskCount: backendProject.taskCount || 0,
    completedTaskCount: backendProject.completedTaskCount || 0,
    
    // UI helpers
    statusColor,
    priorityColor,
    progressColor,
  };
};

// Transform project to summary format for lists
export const transformToProjectSummary = (project: Project): ProjectSummary => ({
  id: project.id,
  name: project.name,
  status: project.status,
  priority: project.priority,
  progress: project.progress,
  memberCount: project.memberCount,
  taskCount: project.taskCount,
  daysRemaining: project.daysRemaining,
  isOverdue: project.isOverdue,
  statusColor: project.statusColor,
  priorityColor: project.priorityColor,
});

// Transform form data to create DTO
export const transformFormToCreateDTO = (formData: ProjectFormData): CreateProjectDTO => {
  return {
    name: formData.name.trim(),
    description: formData.description?.trim() || '',
    startDate: formData.startDate,
    endDate: formData.endDate,
    status: 'PLANNED', // Default status
    priority: 'MEDIUM', // Default priority
    emailPm: '', // No emailPm in backend JWT auth
    ownerId: 0, // Will be set by backend
    organizationId: formData.isPersonal ? null : 1, // Use null for personal projects, 1 for org projects
    budget: undefined,
    teamIds: formData.isPersonal ? [] : (formData.teamId ? [formData.teamId] : []),
    isPersonal: formData.isPersonal,
  };
};

// Validation helper
export const validateProjectData = (data: Partial<CreateProjectDTO | UpdateProjectDTO>): string[] => {
  const errors: string[] = [];
  
  if (data.name !== undefined && !data.name.trim()) {
    errors.push('Project name is required');
  }
  
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start >= end) {
      errors.push('End date must be after start date');
    }
  }
  
  if (data.emailPm !== undefined && data.emailPm) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.emailPm)) {
      errors.push('Project manager email must be valid');
    }
  }
  
  if (data.budget !== undefined && data.budget !== null && data.budget < 0) {
    errors.push('Budget must be non-negative');
  }
  
  return errors;
};

// Projects Service - Main CRUD Operations
const projectsService = {
  // Get project by ID
  getProject: async (id: number): Promise<Project> => {
    try {
      const backendProject = await BaseApiClient.get<BackendProject>(`/api/projects/${id}`);
      return transformBackendProject(backendProject);
    } catch (error) {
      console.error('❌ Failed to fetch project:', error);
      throw error;
    }
  },

  // Get current user's projects (using correct endpoint from API integration guide)
  getProjects: async (params?: ProjectQueryParams): Promise<{
    projects: Project[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    try {
      const {
        page = 0,
        size = 20,
        search
      } = params || {};

      // Use the correct endpoint from API integration guide: /api/users/me/projects
      const responseData = await BaseApiClient.get<UserProjectsResponse>('/api/users/me/projects', {
        params: { page, size, q: search }
      });

      // Handle response data - could be paginated or simple array
      if ('content' in responseData && Array.isArray(responseData.content)) {
        // Paginated response
        const projects = responseData.content.map(transformBackendProject);

        return {
          projects,
          totalElements: responseData.totalElements || 0,
          totalPages: responseData.totalPages || 0,
          currentPage: responseData.number || 0,
          pageSize: responseData.size || size,
        };
      } else if (Array.isArray(responseData)) {
        // Simple array response
        const projects = responseData.map(transformBackendProject);

        return {
          projects,
          totalElements: projects.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: projects.length,
        };
      } else {
        // Empty or invalid response

        return {
          projects: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
        };
      }
    } catch (error) {
      console.error('❌ Failed to fetch user projects:', error);
      throw error;
    }
  },

  // Create new project
  createProject: async (data: CreateProjectDTO): Promise<Project> => {
    try {
      // Validate data
      const validationErrors = validateProjectData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      console.log('📤 ProjectService: Sending to backend:', JSON.stringify(data, null, 2));
      
      const backendProject = await BaseApiClient.post<BackendProject>('/api/projects', data);

      return transformBackendProject(backendProject);
    } catch (error: unknown) {
      console.error('❌ Failed to create project:', error);
      throw error;
    }
  },

  // Update existing project
  updateProject: async (id: number, data: UpdateProjectDTO): Promise<Project> => {
    try {
      // Validate data
      const validationErrors = validateProjectData(data);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Remove undefined fields
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );

      console.log('📤 ProjectService: Sending update to backend:', cleanData);
      
      const backendProject = await BaseApiClient.put<BackendProject>(`/api/projects/${id}`, cleanData);

      return transformBackendProject(backendProject);
    } catch (error) {
      console.error('❌ Failed to update project:', error);
      throw error;
    }
  },

  // Delete project with enhanced error handling
  deleteProject: async (id: number): Promise<void> => {
    try {
      console.log(`🗑️ ProjectService: Deleting project with ID: ${id}`);

      await BaseApiClient.delete(`/api/projects/${id}`);

      console.log(`✅ ProjectService: Successfully deleted project ${id}`);
    } catch (error: any) {
      console.error('❌ Failed to delete project:', error);

      // Enhanced error handling with specific messages in English
      const status = error?.response?.status || error?.status;
      const message = error?.response?.data?.message || error?.message;

      if (status === 403) {
        throw new Error('You do not have permission to delete this project');
      } else if (status === 404) {
        throw new Error('Project not found or already deleted');
      } else if (status === 409) {
        throw new Error('Cannot delete project with active tasks');
      } else if (status >= 500) {
        throw new Error('Server error. Please try again later');
      } else {
        throw new Error(message || 'Failed to delete project. Please try again');
      }
    }
  },

  // Bulk delete projects
  deleteProjects: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; error: string }[] }> => {
    const results = { success: [], failed: [] };

    for (const id of ids) {
      try {
        await projectsService.deleteProject(id);
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({
          id,
          error: error.message || 'Delete failed'
        });
      }
    }

    return results;
  },

  // ===== API INTEGRATION GUIDE METHODS =====

  // Get other user's projects (Admin/Owner only)
  getUserProjects: async (userId: number): Promise<BackendProject[]> => {
    try {
      return await BaseApiClient.get<BackendProject[]>(`/api/users/${userId}/projects`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        throw new Error('Access denied: You can only view your own projects or need OWNER/ADMIN role');
      }
      console.error('❌ Failed to fetch user projects:', error);
      throw error;
    }
  },

  // Get projects created by specific user (Admin/Owner only)
  getUserCreatedProjects: async (userId: number): Promise<BackendProject[]> => {
    try {
      return await BaseApiClient.get<BackendProject[]>(`/api/users/${userId}/projects/created`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        throw new Error('Access denied: You can only view your own data or need OWNER/ADMIN role');
      }
      console.error('❌ Failed to fetch user created projects:', error);
      throw error;
    }
  },

  // Get projects owned by specific user (Admin/Owner only)
  getUserOwnedProjects: async (userId: number): Promise<BackendProject[]> => {
    try {
      return await BaseApiClient.get<BackendProject[]>(`/api/users/${userId}/projects/owned`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        throw new Error('Access denied: You can only view your own data or need OWNER/ADMIN role');
      }
      console.error('❌ Failed to fetch user owned projects:', error);
      throw error;
    }
  },

  // Update project status
  updateProjectStatus: async (id: number, status: ProjectStatus): Promise<Project> => {
    try {

      return await projectsService.updateProject(id, { status });
    } catch (error) {
      console.error('❌ Failed to update project status:', error);
      throw error;
    }
  },

  // Get project tasks
  getProjectTasks: async (id: number): Promise<ProjectTasksResponse> => {
    try {
      return await BaseApiClient.get<ProjectTasksResponse>(`/api/projects/${id}/tasks`);
    } catch (error) {
      console.error('❌ Failed to fetch project tasks:', error);
      throw error;
    }
  },

  // Get project progress details
  getProjectProgress: async (id: number): Promise<ProjectProgress> => {
    try {
      return await BaseApiClient.get<ProjectProgress>(`/api/projects/${id}/progress`);
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      console.error(`❌ Project Progress API failed with status ${status}:`, (error as { message?: string })?.message);
      
      if (status === 404) {
        console.warn('🚧 Backend endpoint /api/projects/{id}/progress not implemented yet');
      } else if (status === 500) {
        console.warn('💥 Backend server error on project progress endpoint');
      }
      
      // Return mock data if API fails (for development)
      return {
        projectId: id,
        projectName: 'Loading...',
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionPercentage: 0,
        onTimePercentage: 0,
        timeline: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          currentDate: new Date().toISOString().split('T')[0],
          daysElapsed: 0,
          daysRemaining: 0,
          totalDays: 0,
          timeProgress: 0,
          isOnTrack: true,
          isOverdue: false,
        },
        milestones: [],
        teamPerformance: {
          totalMembers: 0,
          activeMembers: 0,
          averageTasksPerMember: 0,
          topPerformers: [],
        },
        recentActivity: [],
        progressTrend: [],
      };
    }
  },

  // Get team projects (projects belonging to a specific team)
  getTeamProjects: async (teamId: number, params?: {
    page?: number;
    size?: number;
    status?: ProjectStatus[];
    priority?: ProjectPriority[];
  }): Promise<{
    projects: Project[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    try {
      // Call team projects endpoint as documented in TEAM_API_DOCUMENTATION.md
      const responseData = await BaseApiClient.get<TeamProjectsResponse>(`/api/teams/${teamId}/projects`);

      // Handle both paginated and simple array responses
      if ('content' in responseData && Array.isArray(responseData.content)) {
        // Paginated response
        const { content, totalElements, totalPages, number, size: pageSize } = responseData;
        const projects = content.map(transformBackendProject);
        
        return {
          projects,
          totalElements: totalElements || 0,
          totalPages: totalPages || 0,
          currentPage: number || 0,
          pageSize: pageSize || 20,
        };
      } else if (Array.isArray(responseData)) {
        // Simple array response
        const projects = responseData.map(transformBackendProject);

        return {
          projects,
          totalElements: projects.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: projects.length,
        };
      } else {
        // Empty or unexpected response
        return {
          projects: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
        };
      }
    } catch (error) {
      console.error('❌ Failed to fetch team projects:', error);
      throw error;
    }
  },

  // Get all tasks from all projects of a team
  getTeamAllTasks: async (teamId: number): Promise<unknown[]> => {
    try {
      // Call team all-tasks endpoint as documented in TEAM_API_DOCUMENTATION.md
      const responseData = await BaseApiClient.get<unknown[]>(`/api/teams/${teamId}/all-tasks`);

      // Return tasks array directly as documented
      return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
      console.error('❌ Failed to fetch team all tasks:', error);
      throw error;
    }
  },

  // Get my projects (user is owner or member)
  getMyProjects: async (params?: {
    page?: number;
    size?: number;
    status?: ProjectStatus[];
    priority?: ProjectPriority[];
  }): Promise<{
    projects: Project[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    try {
      const {
        page = 0,
        size = 20,
        status,
        priority,
      } = params || {};

      // Call user-specific projects endpoint
      const responseData = await BaseApiClient.get<UserProjectsResponse>('/api/users/me/projects', {
        params: {
          page, 
          size,
          status: status?.join(','),
          priority: priority?.join(','),
        }
      });

      // Handle both paginated and simple array responses
      if ('content' in responseData && Array.isArray(responseData.content)) {
        // Paginated response
        const { content, totalElements, totalPages, number, size: pageSize } = responseData;
        const projects = content.map(transformBackendProject);
        
        return {
          projects,
          totalElements: totalElements || 0,
          totalPages: totalPages || 0,
          currentPage: number || 0,
          pageSize: pageSize || size,
        };
      } else if (Array.isArray(responseData)) {
        // Simple array response
        const projects = responseData.map(transformBackendProject);

        return {
          projects,
          totalElements: projects.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: projects.length,
        };
      } else {
        // Empty or unexpected response
        console.warn('⚠️ Unexpected response format:', responseData);

        return {
          projects: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
        };
      }
    } catch (error) {
      console.error('❌ Failed to fetch my projects:', error);
      throw error;
    }
  },

  // Get project statistics
  getProjectStats: async (organizationId?: number): Promise<ProjectStats> => {
    try {
      const params = organizationId ? { organizationId } : {};
      return await BaseApiClient.get<ProjectStats>('/api/projects/stats', { params });
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      console.error(`❌ Project Stats API failed with status ${status}:`, (error as { message?: string })?.message);
      
      if (status === 404) {
        console.warn('🚧 Backend endpoint /api/projects/stats not implemented yet');
      }
      
      // Return default stats if API fails
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        overdueProjects: 0,
        totalBudget: 0,
        actualBudget: 0,
        averageProgress: 0,
        projectsByStatus: {
          PLANNED: 0,
          IN_PROGRESS: 0,
          COMPLETED: 0,
          ON_HOLD: 0,
          CANCELLED: 0,
        },
        projectsByPriority: {
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0,
          URGENT: 0,
        },
      };
    }
  },

  // Search projects
  searchProjects: async (query: string, filters?: Partial<ProjectQueryParams>): Promise<Project[]> => {
    try {
      console.log('🔍 Searching projects with query:', query);
      
      const { projects } = await projectsService.getProjects({
        ...filters,
        search: query,
        size: 50, // Larger size for search results
      });
      

      return projects;
    } catch (error) {
      console.error('❌ Failed to search projects:', error);
      throw error;
    }
  },



};

// Export service and utilities
export { projectsService as default };
export { projectsService };
