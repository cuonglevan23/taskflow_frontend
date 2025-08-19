// Projects Service - Main exports
export { default as projectsService } from './projectService';
export { 
  transformBackendProject,
  transformToProjectSummary,
  transformFormToCreateDTO,
  validateProjectData 
} from './projectService';

// Re-export types for convenience
export type {
  Project,
  BackendProject,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectFormData,
  ProjectSummary,
  ProjectStats,
  ProjectProgress,
  ProjectMilestone,
  TeamMemberProgress,
  ProjectActivity,
  ProgressDataPoint,
  ProjectTask,
  ProjectTasksResponse,
  PaginatedProjectsResponse,
  ProjectQueryParams,
  ProjectStatus,
  ProjectPriority,
  ProjectFilters,
  ProjectValidationError,
  ProjectApiResponse,
  ProjectMember
} from '@/types/project';

// Re-export constants
export {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_COLORS
} from '@/types/project';