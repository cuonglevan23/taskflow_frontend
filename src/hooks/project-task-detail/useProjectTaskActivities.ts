// Custom hook for project task activities management
import { useState, useEffect, useCallback } from 'react';
import { TaskListItem } from '@/components/TaskList/types';
import { ProjectTaskActivitiesService, ProjectTaskActivityDto } from '@/services/tasks/projectTaskActivitiesService';

// Custom Project Task Activity type
export interface ProjectActivity {
  id: string;
  description: string;
  author: {
    name: string;
    avatar?: string | null;
  };
  createdAt: string;
  timeAgo: string;
  activityType: string;
}

interface UseProjectTaskActivitiesProps {
  task: TaskListItem | null;
  isOpen: boolean;
}

export const useProjectTaskActivities = ({ task, isOpen }: UseProjectTaskActivitiesProps) => {
  const [projectActivities, setProjectActivities] = useState<ProjectActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Convert ProjectTaskActivityDto to ProjectActivity - FIXED VERSION
  const convertActivity = useCallback((activity: ProjectTaskActivityDto): ProjectActivity => {
    // FIXED: Use type assertion to access potentially existing fields that may not be in interface
    const activityAny = activity as any;

    // Try multiple avatar sources including potential runtime fields
    const authorAvatar = activity.user?.avatar ||
                        activityAny.authorAvatar ||
                        activityAny.user?.avatarUrl ||
                        null;

    const authorName = activity.user ?
      `${activity.user.firstName || ''} ${activity.user.lastName || ''}`.trim() ||
      activity.user.username ||
      activity.user.email ||
      'Unknown User' :
      activityAny.authorName || 'System';

    return {
      id: activity.id.toString(),
      description: activity.formattedMessage || activity.description || 'Activity occurred',
      author: {
        name: authorName,
        avatar: authorAvatar,
      },
      createdAt: activity.createdAt,
      timeAgo: activity.timeAgo || 'Unknown time',
      activityType: activity.activityType || 'GENERAL',
    };
  }, []);

  // Fetch activities for the task
  const fetchActivities = useCallback(async () => {
    if (!task?.id) return;

    setActivitiesLoading(true);
    try {
      const activities = await ProjectTaskActivitiesService.getTaskActivities(Number(task.id));
      const convertedActivities = activities.map(convertActivity);
      setProjectActivities(convertedActivities);
    } catch (error) {
      console.error('Failed to fetch project task activities:', error);
      setProjectActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, [task?.id, convertActivity]);

  // Fetch activities when panel opens or task changes
  useEffect(() => {
    if (isOpen && task?.id) {
      fetchActivities();
    }
  }, [isOpen, task?.id, fetchActivities]);

  return {
    // State
    projectActivities,
    activitiesLoading,

    // Actions
    fetchActivities,
  };
};
