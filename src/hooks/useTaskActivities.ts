import { useState, useEffect, useCallback } from 'react';
import { TaskActivityService, TaskActivityResponseDto, groupActivitiesByDate } from '@/services/taskActivityService';

interface UseTaskActivitiesProps {
  taskId: string | number;
  enabled?: boolean; // Control when to fetch data
  pollInterval?: number; // Auto-refresh interval in ms
}

interface UseTaskActivitiesReturn {
  activities: TaskActivityResponseDto[];
  groupedActivities: {
    TODAY: TaskActivityResponseDto[];
    YESTERDAY: TaskActivityResponseDto[];
    EARLIER: TaskActivityResponseDto[];
  };
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  activitiesCount: number;
}

export const useTaskActivities = ({
  taskId,
  enabled = true,
  pollInterval
}: UseTaskActivitiesProps): UseTaskActivitiesReturn => {
  const [activities, setActivities] = useState<TaskActivityResponseDto[]>([]);
  const [activitiesCount, setActivitiesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!enabled || !taskId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch activities and count in parallel
      const [activitiesData, countData] = await Promise.all([
        TaskActivityService.getActivities(taskId, 0, 100),
        TaskActivityService.getActivitiesCount(taskId)
      ]);

      // Handle different response structures
      let activitiesArray: TaskActivityResponseDto[] = [];

      if (Array.isArray(activitiesData)) {
        // Direct array response
        activitiesArray = activitiesData;
      } else if (activitiesData.content && Array.isArray(activitiesData.content)) {
        // Paginated response with content property
        activitiesArray = activitiesData.content;
      } else {
        // Fallback - try to extract array from response
        activitiesArray = [];
      }

      setActivities(activitiesArray);
      setActivitiesCount(countData);

    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId, enabled]);

  // Computed grouped activities
  const groupedActivities = groupActivitiesByDate(activities);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Polling effect
  useEffect(() => {
    if (!pollInterval || !enabled) return;

    const interval = setInterval(fetchActivities, pollInterval);
    return () => clearInterval(interval);
  }, [fetchActivities, pollInterval, enabled]);

  return {
    activities,
    groupedActivities,
    isLoading,
    error,
    refetch: fetchActivities,
    activitiesCount
  };
};

// Hook for paginated activities
interface UseTaskActivitiesPaginatedProps {
  taskId: string | number;
  enabled?: boolean;
  pageSize?: number;
}

interface UseTaskActivitiesPaginatedReturn {
  activities: TaskActivityResponseDto[];
  isLoading: boolean;
  error: Error | null;
  totalPages: number;
  currentPage: number;
  totalElements: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
}

export const useTaskActivitiesPaginated = ({
  taskId,
  enabled = true,
  pageSize = 10
}: UseTaskActivitiesPaginatedProps): UseTaskActivitiesPaginatedReturn => {
  const [activities, setActivities] = useState<TaskActivityResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(async (page: number) => {
    if (!enabled || !taskId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use getActivities instead of getActivitiesPaginated
      const response = await TaskActivityService.getActivities(taskId, page, pageSize);

      setActivities(response.content);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch paginated activities'));
      console.error('Error in useTaskActivitiesPaginated:', err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId, enabled, pageSize]);

  // Initial load
  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  const loadNextPage = useCallback(async () => {
    if (currentPage < totalPages - 1) {
      await loadPage(currentPage + 1);
    }
  }, [currentPage, totalPages, loadPage]);

  const loadPreviousPage = useCallback(async () => {
    if (currentPage > 0) {
      await loadPage(currentPage - 1);
    }
  }, [currentPage, loadPage]);

  return {
    activities,
    isLoading,
    error,
    totalPages,
    currentPage,
    totalElements,
    hasNextPage: currentPage < totalPages - 1,
    hasPreviousPage: currentPage > 0,
    loadNextPage,
    loadPreviousPage,
    loadPage
  };
};

// Hook for recent activities only
export const useRecentTaskActivities = (taskId: string | number, enabled: boolean = true) => {
  const [activities, setActivities] = useState<TaskActivityResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecentActivities = useCallback(async () => {
    if (!enabled || !taskId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use getActivities with small page size to get recent activities
      const activitiesData = await TaskActivityService.getActivities(taskId, 0, 5);
      setActivities(activitiesData.content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recent activities'));
      console.error('Error in useRecentTaskActivities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId, enabled]);

  useEffect(() => {
    fetchRecentActivities();
  }, [fetchRecentActivities]);

  return {
    activities,
    isLoading,
    error,
    refetch: fetchRecentActivities
  };
};
