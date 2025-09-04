import { api } from '../api';
import type { DashboardOverviewResponse } from './types';

/**
 * Dashboard API Service with Redis Cache support
 * Provides comprehensive task statistics and analytics
 */
export class DashboardService {
  /**
   * Get dashboard overview with all statistics
   * Uses Redis cache for performance optimization (TTL: 5 minutes)
   */
  async getOverview(): Promise<DashboardOverviewResponse> {
    try {
      const response = await api.get('/api/tasks/dashboard/overview');

      console.log('📊 Dashboard overview loaded:', {
        fromCache: response.data.cacheInfo?.fromCache,
        totalTasks: response.data.taskStats?.totalTasks,
        completionRate: response.data.taskStats?.completionRate,
        cacheKey: response.data.cacheInfo?.cacheKey
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to load dashboard overview:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  /**
   * Clear dashboard cache and force refresh
   * Useful when user wants fresh data immediately
   */
  async clearCache(): Promise<{ message: string; userId: number; timestamp: string }> {
    try {
      const response = await api.delete('/api/tasks/dashboard/cache');

      console.log('🗑️ Dashboard cache cleared:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Failed to clear dashboard cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  /**
   * Get dashboard overview with force refresh
   * Clears cache first, then fetches fresh data
   */
  async getOverviewWithRefresh(): Promise<DashboardOverviewResponse> {
    try {
      // Clear cache first
      await this.clearCache();

      // Then fetch fresh data
      return await this.getOverview();
    } catch (error) {
      console.error('❌ Failed to refresh dashboard:', error);
      throw new Error('Failed to refresh dashboard data');
    }
  }

  /**
   * Get task statistics only (lighter endpoint if available)
   * Fallback to full overview if specific endpoint doesn't exist
   */
  async getTaskStats() {
    try {
      // Try specific stats endpoint first
      const response = await api.get('/api/tasks/dashboard/stats');
      return response.data;
    } catch (error) {
      // Fallback to full overview and extract stats
      const overview = await this.getOverview();
      return overview.taskStats;
    }
  }

  /**
   * Get upcoming tasks only
   * Useful for widgets that only need urgent/due tasks
   */
  async getUpcomingTasks() {
    try {
      const response = await api.get('/api/tasks/dashboard/upcoming');
      return response.data;
    } catch (error) {
      // Fallback to full overview and extract upcoming tasks
      const overview = await this.getOverview();
      return overview.upcomingTasks;
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
