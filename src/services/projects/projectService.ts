// Project Service - Centralized project operations using lib/api.ts
import { api } from '@/lib/api';
import { 
  safeParseDate, 
  formatDateString,
  calculateDaysBetween,
  isDateOverdue 
} from '@/lib/transforms';
import { CookieAuth } from '@/utils/cookieAuth';
import type { 
  ProjectResponseDto as BackendProject,
  Project,
  CreateProjectRequestDto as CreateProjectDTO,
  UpdateProjectRequestDto as UpdateProjectDTO,
  CreateProjectFormData as ProjectFormData,
  ProjectSummary,
  ProjectStats,
  ProjectProgress,
  ProjectTask,
  ProjectTasksResponse,
  PaginatedProjectsResponse,
  ProjectQueryParams,
  ProjectStatus,
  ProjectPriority,
  ProjectsApiResponse
} from '@/types/projects';
import { 
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_COLORS
} from '@/types/project';

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

  // Status and priority colors
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
    emailPm: backendProject.emailPm,
    organizationId: backendProject.organizationId,
    createdAt,
    updatedAt,
    
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
  const userInfo = CookieAuth.getUserInfo();
  const tokenPayload = CookieAuth.getTokenPayload();
  
  return {
    name: formData.name.trim(),
    description: formData.description?.trim() || '',
    startDate: formData.startDate,
    endDate: formData.endDate,
    status: 'PLANNED', // Default status
    priority: 'MEDIUM', // Default priority
    emailPm: userInfo.email || tokenPayload?.email || '',
    ownerId: tokenPayload?.userId || parseInt(userInfo.id || '1'),
    organizationId: formData.isPersonal ? null : (tokenPayload?.organizationId || 1),
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
  
      const response = await api.get<BackendProject>(`/api/projects/${id}`);
      const backendProject = response.data;

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
      const response = await api.get('/api/users/me/projects', {
        params: { page, size, q: search }
      });

      // Handle response data - could be paginated or simple array
      const responseData = response.data;
      
      if (responseData.content && Array.isArray(responseData.content)) {
        // Paginated response
        const projects = responseData.content.map(transformBackendProject);

        return {
          projects,
          totalElements: responseData.totalElements,
          totalPages: responseData.totalPages,
          currentPage: responseData.number,
          pageSize: responseData.size,
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
      
      const response = await api.post<BackendProject>('/api/projects', data);

      
      const transformedProject = transformBackendProject(response.data);

      
      return transformedProject;
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
      
      const response = await api.put<BackendProject>(`/api/projects/${id}`, cleanData);

      
      return transformBackendProject(response.data);
    } catch (error) {
      console.error('❌ Failed to update project:', error);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id: number): Promise<void> => {
    try {

      await api.delete(`/api/projects/${id}`);

    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      throw error;
    }
  },

  // ===== API INTEGRATION GUIDE METHODS =====

  // Get other user's projects (Admin/Owner only)
  getUserProjects: async (userId: number): Promise<BackendProject[]> => {
    try {

      const response = await api.get(`/api/users/${userId}/projects`);

      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Access denied: You can only view your own projects or need OWNER/ADMIN role');
      }
      console.error('❌ Failed to fetch user projects:', error);
      throw error;
    }
  },

  // Get projects created by specific user (Admin/Owner only)
  getUserCreatedProjects: async (userId: number): Promise<BackendProject[]> => {
    try {

      const response = await api.get(`/api/users/${userId}/projects/created`);

      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Access denied: You can only view your own data or need OWNER/ADMIN role');
      }
      console.error('❌ Failed to fetch user created projects:', error);
      throw error;
    }
  },

  // Get projects owned by specific user (Admin/Owner only)
  getUserOwnedProjects: async (userId: number): Promise<BackendProject[]> => {
    try {

      const response = await api.get(`/api/users/${userId}/projects/owned`);

      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
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

      const response = await api.get<ProjectTasksResponse>(`/api/projects/${id}/tasks`);

      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch project tasks:', error);
      throw error;
    }
  },

  // Get project progress details
  getProjectProgress: async (id: number): Promise<ProjectProgress> => {
    try {

      const response = await api.get<ProjectProgress>(`/api/projects/${id}/progress`);

      return response.data;
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      console.error(`❌ Project Progress API failed with status ${status}:`, (error as { message?: string })?.message);
      
      if (status === 404) {
        console.warn('🚧 Backend endpoint /api/projects/{id}/progress not implemented yet');
      } else if (status === 500) {
        console.warn('💥 Backend server error on project progress endpoint');
      }
      
      // Return mock data if API fails (for development)
      const mockProgress: ProjectProgress = {
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
      
      return mockProgress;
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
      const {
        page = 0,
        size = 20,
        status,
        priority,
      } = params || {};

      // Call team projects endpoint as documented in TEAM_API_DOCUMENTATION.md
      const response = await api.get(`/api/teams/${teamId}/projects`);

      // Handle both paginated and simple array responses
      if (response.data?.content && Array.isArray(response.data.content)) {
        // Paginated response
        const { content, totalElements, totalPages, number, size: pageSize } = response.data;
        const projects = content.map(transformBackendProject);
        
        return {
          projects,
          totalElements,
          totalPages,
          currentPage: number,
          pageSize,
        };
      } else if (Array.isArray(response.data)) {
        // Simple array response
        const projects = response.data.map(transformBackendProject);
        
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
  getTeamAllTasks: async (teamId: number): Promise<any[]> => {
    try {
      // Call team all-tasks endpoint as documented in TEAM_API_DOCUMENTATION.md
      const response = await api.get(`/api/teams/${teamId}/all-tasks`);

      // Return tasks array directly as documented
      return Array.isArray(response.data) ? response.data : [];
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
      const response = await api.get('/api/users/me/projects', {
        params: { 
          page, 
          size,
          status: status?.join(','),
          priority: priority?.join(','),
        }
      });



      // Handle both paginated and simple array responses
      if (response.data?.content && Array.isArray(response.data.content)) {
        // Paginated response
        const { content, totalElements, totalPages, number, size: pageSize } = response.data;
        const projects = content.map(transformBackendProject);
        

        
        return {
          projects,
          totalElements,
          totalPages,
          currentPage: number,
          pageSize,
        };
      } else if (Array.isArray(response.data)) {
        // Simple array response
        const projects = response.data.map(transformBackendProject);
        

        
        return {
          projects,
          totalElements: projects.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: projects.length,
        };
      } else {
        // Empty or unexpected response
        console.warn('⚠️ Unexpected response format:', response.data);
        
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
      const response = await api.get<ProjectStats>('/api/projects/stats', { params });
      

      return response.data;
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