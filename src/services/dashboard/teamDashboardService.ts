import BaseApiClient from '@/lib/baseApiClient';
import { useState, useEffect } from 'react';
import type {
    TeamDashboardResponseDto,
    TeamStats,
    MemberBreakdown,
    ProjectBreakdown,
    UpcomingDeadlines,
    TeamPerformance,
    ChartDataItem,
    TeamEfficiencyMetrics,
    DeadlineTask,
    OverdueTask
} from '@/types/teamDashboard';

/**
 * Team Dashboard API Service with Redis Cache support
 * Provides comprehensive team statistics, member analysis, and performance metrics
 * Updated to use BaseApiClient for consistent error handling and authentication
 */
export class TeamDashboardService {
    /**
     * Get team dashboard overview with all statistics
     * Uses Redis cache for performance optimization (TTL: 5 minutes)
     */
    async getTeamOverview(teamId: number): Promise<TeamDashboardResponseDto> {
        try {
            const data = await BaseApiClient.get<TeamDashboardResponseDto>(
                `/api/teams/${teamId}/dashboard/overview`
            );

            console.log('📊 Team dashboard overview loaded:', {
                teamId,
                totalMembers: data.teamStats?.totalMembers,
                totalProjects: data.teamStats?.totalProjects,
                teamEfficiency: data.teamStats?.teamEfficiency,
                completionRate: data.teamStats?.completionRate
            });

            return data;
        } catch (error) {
            console.error('❌ Failed to load team dashboard overview:', error);
            throw new Error('Failed to load team dashboard data');
        }
    }

    /**
     * Clear team dashboard cache and force refresh
     * Useful when team data is updated and fresh data is needed
     */
    async clearTeamCache(teamId: number): Promise<{ message: string; teamId: number; timestamp: string }> {
        try {
            const data = await BaseApiClient.delete<{ message: string; teamId: number; timestamp: string }>(
                `/api/teams/${teamId}/dashboard/cache`
            );

            console.log('🗑️ Team dashboard cache cleared:', data);

            return data;
        } catch (error) {
            console.error('❌ Failed to clear team dashboard cache:', error);
            throw new Error('Failed to clear team cache');
        }
    }

    /**
     * Get team dashboard overview with force refresh
     * Clears cache first, then fetches fresh data
     */
    async getTeamOverviewWithRefresh(teamId: number): Promise<TeamDashboardResponseDto> {
        await this.clearTeamCache(teamId);
        return this.getTeamOverview(teamId);
    }

    /**
     * Get team member performance details
     */
    async getTeamMemberPerformance(teamId: number): Promise<MemberBreakdown> {
        try {
            const data = await BaseApiClient.get<MemberBreakdown>(
                `/api/teams/${teamId}/members/performance`
            );

            console.log('👥 Team member performance loaded:', {
                teamId,
                roleCount: data.byRole?.length,
                memberCount: data.byWorkload?.length
            });

            return data;
        } catch (error) {
            console.error('❌ Failed to load team member performance:', error);
            throw new Error('Failed to load member performance data');
        }
    }

    /**
     * Get upcoming deadlines for team
     */
    async getTeamDeadlines(teamId: number): Promise<UpcomingDeadlines> {
        try {
            const data = await BaseApiClient.get<UpcomingDeadlines>(
                `/api/teams/${teamId}/deadlines`
            );

            console.log('📅 Team deadlines loaded:', {
                teamId,
                thisWeek: data.thisWeek?.length,
                nextWeek: data.nextWeek?.length,
                overdue: data.overdue?.length
            });

            return data;
        } catch (error) {
            console.error('❌ Failed to load team deadlines:', error);
            throw new Error('Failed to load team deadlines');
        }
    }
}

// Create service instance
const teamDashboardService = new TeamDashboardService();

/**
 * Custom hook for team dashboard data management
 */
export function useTeamDashboard(teamId: number) {
    const [data, setData] = useState<TeamDashboardResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            const result = forceRefresh
                ? await teamDashboardService.getTeamOverviewWithRefresh(teamId)
                : await teamDashboardService.getTeamOverview(teamId);

            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (teamId) {
            loadData();
        }
    }, [teamId]);

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
 * Custom hook for team member performance
 */
export function useTeamMemberPerformance(teamId: number) {
    const [data, setData] = useState<MemberBreakdown | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await teamDashboardService.getTeamMemberPerformance(teamId);
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            loadData();
        }
    }, [teamId]);

    return { data, loading, error };
}

/**
 * Transform team stats for chart display
 */
export function transformTeamStatsForChart(teamStats: TeamStats): ChartDataItem[] {
    if (!teamStats) return [];

    return [
        { label: 'Completed', value: teamStats.completedTasks, color: '#10b981' },
        { label: 'Pending', value: teamStats.pendingTasks, color: '#f59e0b' },
        { label: 'Overdue', value: teamStats.overdueTasks, color: '#ef4444' }
    ];
}

/**
 * Transform member breakdown for chart display
 */
export function transformMemberBreakdownForChart(memberBreakdown: MemberBreakdown): ChartDataItem[] {
    if (!memberBreakdown?.byRole) return [];

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return memberBreakdown.byRole.map((role, index) => ({
        label: role.name,
        value: role.count,
        color: colors[index % colors.length]
    }));
}

/**
 * Transform project breakdown for chart display
 */
export function transformProjectBreakdownForChart(projectBreakdown: ProjectBreakdown): ChartDataItem[] {
    if (!projectBreakdown?.byStatus) return [];

    const statusColors: Record<string, string> = {
        'PLANNED': '#6b7280',
        'IN_PROGRESS': '#3b82f6',
        'COMPLETED': '#10b981',
        'ON_HOLD': '#f59e0b',
        'CANCELLED': '#ef4444'
    };

    return projectBreakdown.byStatus.map(status => ({
        label: status.name,
        value: status.count,
        color: statusColors[status.name] || '#6b7280'
    }));
}

/**
 * Calculate team efficiency metrics
 */
export function calculateTeamEfficiency(teamStats: TeamStats): TeamEfficiencyMetrics {
    if (!teamStats) {
        return { efficiency: 0, level: 'Needs Improvement', color: '#ef4444' };
    }

    const efficiency = teamStats.teamEfficiency || 0;

    if (efficiency >= 90) {
        return { efficiency, level: 'Excellent', color: '#10b981' };
    } else if (efficiency >= 75) {
        return { efficiency, level: 'Good', color: '#3b82f6' };
    } else if (efficiency >= 60) {
        return { efficiency, level: 'Average', color: '#f59e0b' };
    } else {
        return { efficiency, level: 'Needs Improvement', color: '#ef4444' };
    }
}

/**
 * Format team completion rate as percentage
 */
export function formatTeamCompletionRate(rate: number): string {
    return `${Math.round(rate * 100)}%`;
}

/**
 * Get priority level for overdue tasks
 */
export function getOverduePriority(daysOverdue: number): { level: string; color: string } {
    if (daysOverdue >= 7) {
        return { level: 'Critical', color: '#dc2626' };
    } else if (daysOverdue >= 3) {
        return { level: 'High', color: '#ef4444' };
    } else if (daysOverdue >= 1) {
        return { level: 'Medium', color: '#f59e0b' };
    } else {
        return { level: 'Low', color: '#10b981' };
    }
}

/**
 * Sort team members by workload
 */
export function sortMembersByWorkload(members: { name: string; count: number }[]): { name: string; count: number }[] {
    return [...members].sort((a, b) => b.count - a.count);
}

/**
 * Filter urgent deadlines (due within 2 days)
 */
export function getUrgentDeadlines(deadlines: DeadlineTask[]): DeadlineTask[] {
    const today = new Date();
    const urgentThreshold = new Date();
    urgentThreshold.setDate(today.getDate() + 2);

    return deadlines.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate <= urgentThreshold;
    });
}

/**
 * Transform monthly trends for area chart
 */
export function transformMonthlyTrendsForChart(monthlyTrends: TeamPerformance['monthlyTrends']) {
    if (!monthlyTrends || monthlyTrends.length === 0) return { labels: [], datasets: [] };

    const labels = monthlyTrends.map(trend => trend.month);

    const datasets = [
        {
            label: 'Tasks Created',
            data: monthlyTrends.map(trend => trend.tasksCreated),
            color: 'rgb(59, 130, 246)',
            fillOpacity: 0.1,
            tension: 0.4,
        },
        {
            label: 'Tasks Completed',
            data: monthlyTrends.map(trend => trend.tasksCompleted),
            color: 'rgb(16, 185, 129)',
            fillOpacity: 0.2,
            tension: 0.4,
        },
    ];

    return { labels, datasets };
}

/**
 * Calculate team productivity score
 */
export function calculateTeamProductivityScore(teamStats: TeamStats): number {
    if (!teamStats || teamStats.totalTasks === 0) return 0;

    const completionRate = teamStats.completedTasks / teamStats.totalTasks;
    const efficiency = teamStats.teamEfficiency / 100;
    const overdueImpact = 1 - (teamStats.overdueTasks / teamStats.totalTasks);

    // Weight: completion (40%), efficiency (40%), overdue impact (20%)
    return Math.round((completionRate * 0.4 + efficiency * 0.4 + overdueImpact * 0.2) * 100);
}

export default teamDashboardService;
