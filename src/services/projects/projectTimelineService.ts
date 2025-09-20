// Project Timeline Service - Specialized service for project timeline operations
import { BaseApiClient } from '@/lib/baseApiClient';
import {
  safeParseDate,
  formatDateString,
} from '@/lib/transforms';
import {
  Target,
  Edit,
  FileText,
  RotateCcw,
  Calendar,
  Flag,
  Crown,
  Settings,
  Trash2
} from 'lucide-react';

// Project Timeline Event types based on API documentation
type ProjectEventType =
  | 'PROJECT_CREATED'
  | 'PROJECT_NAME_CHANGED'
  | 'PROJECT_DESCRIPTION_CHANGED'
  | 'PROJECT_STATUS_CHANGED'
  | 'PROJECT_START_DATE_CHANGED'
  | 'PROJECT_END_DATE_CHANGED'
  | 'PROJECT_OWNER_CHANGED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED';

// Backend Timeline Event Response (matching API specification)
interface BackendTimelineEvent {
  id: number;
  eventType: ProjectEventType;
  eventDescription: string;
  oldValue: string | null;
  newValue: string | null;
  changedByUserName: string;
  changedByUserEmail: string;
  createdAt: string; // LocalDateTime format: "2025-09-17T12:00:00"
}

// Frontend Timeline Event (transformed)
interface ProjectTimelineEvent {
  id: string;
  eventType: ProjectEventType;
  eventDescription: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: {
    userName: string;
    userEmail: string;
  };
  createdAt: Date;
  createdAtString: string;

  // UI helpers
  eventColor: string;
  eventIcon: any; // Changed from string to any to accommodate React components
  isImportant: boolean;
}

// Project Timeline Data (collection of events)
interface ProjectTimelineData {
  projectId: string;
  events: ProjectTimelineEvent[];

  // Timeline statistics
  stats: {
    totalEvents: number;
    recentEvents: number; // Events in last 7 days
    eventsByType: Record<ProjectEventType, number>;
    mostActiveUser: {
      userName: string;
      userEmail: string;
      eventCount: number;
    } | null;
  };

  // Grouped events for better UI display
  groupedEvents: {
    today: ProjectTimelineEvent[];
    yesterday: ProjectTimelineEvent[];
    thisWeek: ProjectTimelineEvent[];
    thisMonth: ProjectTimelineEvent[];
    older: ProjectTimelineEvent[];
  };
}

// Event type configurations for UI
const EVENT_CONFIG: Record<ProjectEventType, {
  color: string;
  icon: any; // Changed from string to any to accommodate React components
  isImportant: boolean;
  label: string;
}> = {
  PROJECT_CREATED: {
    color: '#10B981', // Green
    icon: Target,
    isImportant: true,
    label: 'Project Created'
  },
  PROJECT_NAME_CHANGED: {
    color: '#3B82F6', // Blue
    icon: Edit,
    isImportant: false,
    label: 'Name Changed'
  },
  PROJECT_DESCRIPTION_CHANGED: {
    color: '#6B7280', // Gray
    icon: FileText,
    isImportant: false,
    label: 'Description Updated'
  },
  PROJECT_STATUS_CHANGED: {
    color: '#F59E0B', // Orange
    icon: RotateCcw,
    isImportant: true,
    label: 'Status Changed'
  },
  PROJECT_START_DATE_CHANGED: {
    color: '#8B5CF6', // Purple
    icon: Calendar,
    isImportant: true,
    label: 'Start Date Changed'
  },
  PROJECT_END_DATE_CHANGED: {
    color: '#EC4899', // Pink
    icon: Flag,
    isImportant: true,
    label: 'End Date Changed'
  },
  PROJECT_OWNER_CHANGED: {
    color: '#F59E0B', // Orange
    icon: Crown,
    isImportant: true,
    label: 'Owner Changed'
  },
  PROJECT_UPDATED: {
    color: '#6B7280', // Gray
    icon: Settings,
    isImportant: false,
    label: 'Project Updated'
  },
  PROJECT_DELETED: {
    color: '#EF4444', // Red
    icon: Trash2,
    isImportant: true,
    label: 'Project Deleted'
  },
};

// Transform backend timeline event to frontend format
const transformBackendTimelineEvent = (backendEvent: BackendTimelineEvent): ProjectTimelineEvent => {
  const createdAt = safeParseDate(backendEvent.createdAt);
  const config = EVENT_CONFIG[backendEvent.eventType];

  return {
    id: backendEvent.id.toString(),
    eventType: backendEvent.eventType,
    eventDescription: backendEvent.eventDescription,
    oldValue: backendEvent.oldValue,
    newValue: backendEvent.newValue,
    changedBy: {
      userName: backendEvent.changedByUserName,
      userEmail: backendEvent.changedByUserEmail,
    },
    createdAt,
    createdAtString: formatDateString(backendEvent.createdAt),

    // UI helpers
    eventColor: config.color,
    eventIcon: config.icon,
    isImportant: config.isImportant,
  };
};

// Group events by time periods for UI display
const groupEventsByTime = (events: ProjectTimelineEvent[]): ProjectTimelineData['groupedEvents'] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const grouped = {
    today: [] as ProjectTimelineEvent[],
    yesterday: [] as ProjectTimelineEvent[],
    thisWeek: [] as ProjectTimelineEvent[],
    thisMonth: [] as ProjectTimelineEvent[],
    older: [] as ProjectTimelineEvent[],
  };

  events.forEach(event => {
    const eventDate = event.createdAt;

    if (eventDate >= today) {
      grouped.today.push(event);
    } else if (eventDate >= yesterday) {
      grouped.yesterday.push(event);
    } else if (eventDate >= thisWeek) {
      grouped.thisWeek.push(event);
    } else if (eventDate >= thisMonth) {
      grouped.thisMonth.push(event);
    } else {
      grouped.older.push(event);
    }
  });

  return grouped;
};

// Calculate timeline statistics
const calculateTimelineStats = (events: ProjectTimelineEvent[]): ProjectTimelineData['stats'] => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Count recent events
  const recentEvents = events.filter(event => event.createdAt >= sevenDaysAgo).length;

  // Count events by type
  const eventsByType = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<ProjectEventType, number>);

  // Find most active user
  const userEventCounts = events.reduce((acc, event) => {
    const key = `${event.changedBy.userName}|${event.changedBy.userEmail}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActiveUserKey = Object.keys(userEventCounts).reduce((a, b) =>
    userEventCounts[a] > userEventCounts[b] ? a : b
  , '');

  const mostActiveUser = mostActiveUserKey ? {
    userName: mostActiveUserKey.split('|')[0],
    userEmail: mostActiveUserKey.split('|')[1],
    eventCount: userEventCounts[mostActiveUserKey],
  } : null;

  return {
    totalEvents: events.length,
    recentEvents,
    eventsByType,
    mostActiveUser,
  };
};

// Transform backend timeline response to frontend format
const transformTimelineResponse = (
  projectId: string,
  backendEvents: BackendTimelineEvent[]
): ProjectTimelineData => {
  // Sort events by date (newest first)
  const sortedBackendEvents = [...backendEvents].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Transform events
  const events = sortedBackendEvents.map(transformBackendTimelineEvent);

  // Calculate stats
  const stats = calculateTimelineStats(events);

  // Group events
  const groupedEvents = groupEventsByTime(events);

  return {
    projectId,
    events,
    stats,
    groupedEvents,
  };
};

// API Error types (matching backend responses)
interface ProjectTimelineApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// Project Timeline Service - Main operations
const projectTimelineService = {
  // Get project timeline events
  getProjectTimeline: async (projectId: number): Promise<ProjectTimelineData> => {
    try {
      console.log(`📊 ProjectTimelineService: Fetching timeline for project ${projectId}`);

      const backendEvents = await BaseApiClient.get<BackendTimelineEvent[]>(`/api/projects/${projectId}/timeline`);

      const timelineData = transformTimelineResponse(projectId.toString(), backendEvents);

      console.log(`✅ ProjectTimelineService: Successfully fetched ${timelineData.events.length} timeline events for project ${projectId}`);
      return timelineData;
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number; data?: ProjectTimelineApiError }; status?: number; message?: string };
      const status = apiError.response?.status || apiError.status;
      const errorData = apiError.response?.data;

      console.error(`❌ Project Timeline API failed with status ${status}:`, errorData?.message || apiError.message);

      if (status === 404) {
        throw new Error(errorData?.message || 'Project not found');
      } else if (status === 403) {
        throw new Error(
          errorData?.message ||
          'You don\'t have permission to view this project. You must be the creator, owner, project member, or team member to access this project.'
        );
      } else if (status === 500) {
        throw new Error('Server error. Please try again later');
      } else {
        throw new Error(errorData?.message || 'Failed to fetch project timeline. Please try again');
      }
    }
  },

  // Get only recent timeline events (last 7 days)
  getRecentTimeline: async (projectId: number): Promise<ProjectTimelineEvent[]> => {
    try {
      const timeline = await projectTimelineService.getProjectTimeline(projectId);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return timeline.events.filter(event => event.createdAt >= sevenDaysAgo);
    } catch (error) {
      console.error('❌ Failed to fetch recent timeline events:', error);
      throw error;
    }
  },

  // Get timeline events by type
  getTimelineByEventType: async (projectId: number, eventType: ProjectEventType): Promise<ProjectTimelineEvent[]> => {
    try {
      const timeline = await projectTimelineService.getProjectTimeline(projectId);
      return timeline.events.filter(event => event.eventType === eventType);
    } catch (error) {
      console.error('❌ Failed to fetch timeline events by type:', error);
      throw error;
    }
  },

  // Get timeline statistics only
  getTimelineStats: async (projectId: number): Promise<ProjectTimelineData['stats']> => {
    try {
      const timeline = await projectTimelineService.getProjectTimeline(projectId);
      return timeline.stats;
    } catch (error) {
      console.error('❌ Failed to fetch timeline statistics:', error);
      throw error;
    }
  },

  // Get grouped timeline events for UI display
  getGroupedTimeline: async (projectId: number): Promise<ProjectTimelineData['groupedEvents']> => {
    try {
      const timeline = await projectTimelineService.getProjectTimeline(projectId);
      return timeline.groupedEvents;
    } catch (error) {
      console.error('❌ Failed to fetch grouped timeline events:', error);
      throw error;
    }
  },

  // Get timeline events for a specific user
  getTimelineByUser: async (projectId: number, userName: string): Promise<ProjectTimelineEvent[]> => {
    try {
      const timeline = await projectTimelineService.getProjectTimeline(projectId);
      return timeline.events.filter(event => event.changedBy.userName === userName);
    } catch (error) {
      console.error('❌ Failed to fetch timeline events by user:', error);
      throw error;
    }
  },

  // Get timeline events within date range
  getTimelineByDateRange: async (
    projectId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ProjectTimelineEvent[]> => {
    try {
      const timeline = await projectTimelineService.getProjectTimeline(projectId);
      return timeline.events.filter(event =>
        event.createdAt >= startDate && event.createdAt <= endDate
      );
    } catch (error) {
      console.error('❌ Failed to fetch timeline events by date range:', error);
      throw error;
    }
  },

  // Get important timeline events only
  getImportantTimeline: async (projectId: number): Promise<ProjectTimelineEvent[]> => {
    try {
      const timeline = await projectTimelineService.getProjectTimeline(projectId);
      return timeline.events.filter(event => event.isImportant);
    } catch (error) {
      console.error('❌ Failed to fetch important timeline events:', error);
      throw error;
    }
  },

  // Format timeline event for display
  formatTimelineEvent: (event: ProjectTimelineEvent): string => {
    const config = EVENT_CONFIG[event.eventType];
    const timeAgo = projectTimelineService.getTimeAgo(event.createdAt);

    return `${config.icon} ${event.eventDescription} • ${timeAgo} • by ${event.changedBy.userName}`;
  },

  // Get human-readable time ago string
  getTimeAgo: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  },

  // Check if user has timeline access
  hasTimelineAccess: async (projectId: number): Promise<boolean> => {
    try {
      await projectTimelineService.getProjectTimeline(projectId);
      return true;
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 403) {
        return false;
      }
      // For other errors (404, 500, etc.), rethrow
      throw error;
    }
  },
};

export default projectTimelineService;

// Export types and utilities
export {
  EVENT_CONFIG,
  type ProjectEventType,
  type BackendTimelineEvent,
  type ProjectTimelineEvent,
  type ProjectTimelineData,
  type ProjectTimelineApiError,
};
