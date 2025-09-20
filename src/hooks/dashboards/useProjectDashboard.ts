'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardService, ProjectDashboardResponse } from '@/services/dashboard/projectDashboardService';

interface UseProjectDashboardReturn {
  data: ProjectDashboardResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearAndRefetch: () => Promise<void>;
}

/**
 * Custom hook for fetching project dashboard data
 * Provides loading states, error handling, and refresh functionality
 */
export function useProjectDashboard(projectId: string | undefined): UseProjectDashboardReturn {
  const [data, setData] = useState<ProjectDashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dashboardData = await dashboardService.getProjectDashboard(projectId);
      setData(dashboardData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const clearAndRefetch = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      await dashboardService.clearCache();
      await fetchDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh dashboard data';
      setError(errorMessage);
    }
  }, [projectId, fetchDashboardData]);

  // Fetch data when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchDashboardData();
    } else {
      setData(null);
      setError(null);
    }
  }, [fetchDashboardData, projectId]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
    clearAndRefetch
  };
}
