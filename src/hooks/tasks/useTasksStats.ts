// Task Statistics Hooks - Data analytics and metrics
import useSWR from 'swr';
import { taskService } from '@/services/task';
import { taskKeys } from './useTasksData';
import type { TaskFilter } from '@/services/task';

// Hook: Get task statistics
export const useTaskStats = (filter?: TaskFilter) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    [...taskKeys.all, 'stats', filter],
    () => taskService.getTaskStats(filter),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get My Tasks Statistics
export const useMyTasksStats = () => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    [...taskKeys.myTasks(), 'stats'],
    () => taskService.getMyTasksStats(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get task completion analytics
export const useTaskAnalytics = (timeRange?: 'week' | 'month' | 'quarter' | 'year') => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    [...taskKeys.all, 'analytics', timeRange],
    () => {
      // This could be a future endpoint for detailed analytics
      // For now, return basic stats
      return taskService.getMyTasksStats();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    revalidate,
  };
};

// Hook: Get task trends (completion rate over time)
export const useTaskTrends = (days = 30) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    [...taskKeys.all, 'trends', days],
    () => {
      // Future endpoint for trend analysis
      // For now, return basic structure
      return Promise.resolve({
        period: days,
        completionRate: 0,
        trend: 'stable' as 'up' | 'down' | 'stable',
        dailyCompletions: [] as Array<{ date: string; completed: number; created: number }>
      });
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  return {
    trends: data,
    isLoading,
    error,
    revalidate,
  };
};