/**
 * Main Services Export
 * Central export file for all task-related services
 */

// Task Activity Services
export { TaskActivityService, getActivityConfig, groupActivitiesByDate } from './taskActivityService';
export type {
  TaskActivityResponseDto,
  UserProfileDto,
  TaskActivityType,
  PaginatedActivitiesResponse
} from './taskActivityService';

// Simple File Services - New Implementation (No Progress Tracking)
export { default as simpleFileService } from './simpleFileService';
export type {
  TaskAttachment,
  AttachmentStats,
  PresignedUploadRequest,
  PresignedUploadResponse,
  UploadSuccessRequest
} from './simpleFileService';

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

// Services exports
export { default as GoogleCalendarService } from './googleCalendarService';
export * from './googleCalendarService';

// Re-export other services
export { default as TaskService } from './taskService';
export { default as CommentService } from './commentService';
export { default as ProgressService } from './progressService';
export { default as TaskActivityService } from './taskActivityService';
export { default as TeamMemberService } from './teamMemberService';
export { default as SimpleFileService } from './simpleFileService';
