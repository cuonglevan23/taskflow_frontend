// Global Context Providers - Senior Product Code
export { AppProvider as default } from './AppProvider';
export { ProjectsProvider, useProjectsContext, PROJECT_COLORS } from './ProjectsContext';
export { TasksProvider, useTasksContext } from './TasksContext';
export { NotificationProvider, useNotifications, useInboxNotifications, useHeaderNotifications, useBookmarkedNotifications, useArchivedNotifications } from './NotificationContext';


// Type Exports for Global Data Models
export type { 
  Project, 
  ProjectColorKey,
  ProjectsContextType 
} from './ProjectsContext';

export type { 
  Task, 
  AssignedTask, 
  Goal,
  TasksContextType 
} from './TasksContext';

export type { 
  BaseNotification, 
  NotificationActions, 
  NotificationFilters, 
  NotificationStats, 
  NotificationType, 
  NotificationPriority, 
  NotificationStatus,
  NotificationContextType 
} from './NotificationContext';