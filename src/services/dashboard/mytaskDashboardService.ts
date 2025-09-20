import BaseApiClient from '@/lib/baseApiClient';
import { useState, useEffect } from 'react';
import type { DashboardOverviewResponse } from '@/types/mytaskdashboard';

/**
 * Dashboard API Service with Redis Cache support
 * Provides comprehensive task statistics and analytics
 * Updated to use BaseApiClient for consistent error handling and authentication
 */
export class DashboardService {
    /**
     * Get dashboard overview with all statistics
     * Uses Redis cache for performance optimization (TTL: 5 minutes)
     */
    async getOverview(): Promise<DashboardOverviewResponse> {
        try {
            const data = await BaseApiClient.get<DashboardOverviewResponse>('/api/tasks/dashboard/overview');

            console.log('📊 Dashboard overview loaded:', {
                fromCache: data.cacheInfo?.fromCache,
                totalTasks: data.taskStats?.totalTasks,
                completionRate: data.taskStats?.completionRate,
                cacheKey: data.cacheInfo?.cacheKey
            });

            return data;
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
            const data = await BaseApiClient.delete<{ message: string; userId: number; timestamp: string }>('/api/tasks/dashboard/cache');

            console.log('🗑️ Dashboard cache cleared:', data);

            return data;
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
        await this.clearCache();
        return this.getOverview();
    }
}

// Create service instance
const dashboardService = new DashboardService();

/**
 * Custom hook for dashboard data management
 */
export function useDashboard() {
    const [data, setData] = useState<DashboardOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            const result = forceRefresh
                ? await dashboardService.getOverviewWithRefresh()
                : await dashboardService.getOverview();

            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const refresh = () => loadData(false);
    const forceRefresh = () => loadData(true);

    return {
        data,
        loading,
        error,
        refresh,
        forceRefresh
    };
}

/**
 * Format completion rate as percentage
 */
export function formatCompletionRate(rate: number): string {
    return `${Math.round(rate * 100)}%`;
}

/**
 * Get task priority color
 */
export function getTaskPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
        case 'high':
            return '#ef4444'; // red-500
        case 'medium':
            return '#f59e0b'; // amber-500
        case 'low':
            return '#10b981'; // emerald-500
        default:
            return '#6b7280'; // gray-500
    }
}

/**
 * Transform data for chart display
 */
export function transformForChart(data: any) {
    if (!data) return [];

    return [
        { name: 'Completed', value: data.completedTasks || 0, color: '#10b981' },
        { name: 'In Progress', value: data.inProgressTasks || 0, color: '#3b82f6' },
        { name: 'Pending', value: data.pendingTasks || 0, color: '#f59e0b' },
        { name: 'Overdue', value: data.overdueTasks || 0, color: '#ef4444' }
    ];
}

/**
 * Format cache expiry time
 */
export function formatCacheExpiry(expiry: string): string {
    const date = new Date(expiry);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) {
        return 'Expired';
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

/**
 * Calculate productivity score based on task completion
 */
export function calculateProductivityScore(data: any): number {
    if (!data || !data.taskStats) return 0;

    const { completedTasks = 0, totalTasks = 0, onTimeTasks = 0 } = data.taskStats;

    if (totalTasks === 0) return 0;

    const completionRate = completedTasks / totalTasks;
    const onTimeRate = onTimeTasks / completedTasks || 0;

    // Weight completion rate (70%) and on-time rate (30%)
    return Math.round((completionRate * 0.7 + onTimeRate * 0.3) * 100);
}

/**
 * Get productivity level based on score
 */
export function getProductivityLevel(score: number): { level: string; color: string } {
    if (score >= 90) {
        return { level: 'Excellent', color: '#10b981' };
    } else if (score >= 75) {
        return { level: 'Good', color: '#3b82f6' };
    } else if (score >= 60) {
        return { level: 'Average', color: '#f59e0b' };
    } else {
        return { level: 'Needs Improvement', color: '#ef4444' };
    }
}

export default dashboardService;
