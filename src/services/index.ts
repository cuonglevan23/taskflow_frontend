// Services - Main barrel exports for clean imports
// Usage: import { tasksService, usersService, teamsService } from '@/services';

// Export all services
export * from './tasks';
export * from './users';
export * from './teams';

// Export common utilities
export { api, ApiClient } from '@/lib/api';
export * from '@/lib/transforms';

// Backward compatibility exports
export { tasksService as taskService } from './tasks';
export { api as apiClient } from '@/lib/api';