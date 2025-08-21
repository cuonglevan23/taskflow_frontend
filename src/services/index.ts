/**
 * Main Services Export
 * Central export file for all task-related services
 */

// Project Task Services
export { projectTaskService } from './projects';
export type {
  CreateProjectTaskRequest,
  UpdateProjectTaskRequest,
  ProjectTaskFilters,
  ProjectTaskResponseDto,
  ProjectTaskPage,
  ProjectTaskStats,
  ProjectTaskAssignee,
} from './projects';

// Team Task Services
export { teamTaskService } from './teams';
export type {
  CreateTeamTaskRequest,
  UpdateTeamTaskRequest,
  TeamTaskFilters,
  TeamTaskResponseDto,
  TeamTaskPage,
  TeamTaskStats,
  TeamTaskAssignedMember,
  TeamTaskCategory,
  RecurrencePattern,
} from './teams';

// Unified Task Services
export { unifiedTaskService } from './tasks';
export type {
  UnifiedTaskDto,
  UnifiedTaskStats,
  UnifiedTaskPage,
  UnifiedTaskFilters,
} from './tasks';

// Re-export existing services for backward compatibility
export { default as tasksService } from './tasks/tasksService';
export { default as projectsService } from './projects/projectsService';
export { default as teamsService } from './teams/teamsService';