import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from './dashboardService';
import type { DashboardOverviewResponse, DashboardHookResult } from './types';

/**
 * Custom hook for dashboard data management
 * Provides loading states, error handling, and refresh capabilities
 */
export const useDashboard = (): DashboardHookResult => {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      let dashboardData: DashboardOverviewResponse;
      
      if (forceRefresh) {
        dashboardData = await dashboardService.getOverviewWithRefresh();
      } else {
        dashboardData = await dashboardService.getOverview();
      }

      setData(dashboardData);

      console.log('📊 Dashboard loaded:', {
        fromCache: dashboardData.cacheInfo.fromCache,
        totalTasks: dashboardData.taskStats.totalTasks,
        completionRate: dashboardData.taskStats.completionRate
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Manual refresh functions
  const refresh = useCallback(() => {
    return loadDashboard(false);
  }, [loadDashboard]);

  const forceRefresh = useCallback(() => {
    return loadDashboard(true);
  }, [loadDashboard]);

  return {
    data,
    loading,
    error,
    refresh,
    forceRefresh
  };
};

/**
 * Lightweight hook for task statistics only
 * Useful for components that only need basic stats
 */
export const useTaskStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const taskStats = await dashboardService.getTaskStats();
        setStats(taskStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading, error };
};

/**
 * Hook for upcoming tasks only
 * Useful for notification widgets or urgent task displays
 */
export const useUpcomingTasks = () => {
  const [upcomingTasks, setUpcomingTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUpcomingTasks = async () => {
      try {
        setLoading(true);
        const tasks = await dashboardService.getUpcomingTasks();
        setUpcomingTasks(tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load upcoming tasks');
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingTasks();
  }, []);

  return { upcomingTasks, loading, error };
};
