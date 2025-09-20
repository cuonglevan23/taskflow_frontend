/**
 * Project Services Export
 */

// Export existing projectService as projectsService for backward compatibility
export { default as projectsService } from './projectService';

// Export new projectTimelineService
export { default as projectTimelineService } from './projectTimelineService';
export * from './projectTimelineService';
