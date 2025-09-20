/**
 * Unified Task Services Export
 */

// Export existing task services for backward compatibility
export { tasksService } from './tasksService';

// Export project task services
export { default as ProjectTaskService } from './projectTaskService';
export { default as ProjectTaskCommentsService } from './projectTaskCommentsService';
export { default as ProjectTaskActivitiesService } from './projectTaskActivitiesService';
export { default as ProjectTaskGoogleCalendarService } from './projectTaskGoogleCalendarService';
export { default as ProjectMembersService } from '../projects/projectMembersService';

// Export types
export * from './types';
export * from './projectTaskGoogleCalendarService';
