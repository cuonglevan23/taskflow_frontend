import { useState, useEffect } from 'react';
import { useTeamDashboard } from '@/services/dashboard/teamDashboardService';
import type {
    TeamDashboardResponseDto,
    TeamStats,
    MemberBreakdown,
    ProjectBreakdown,
    UpcomingDeadlines,
    TeamPerformance
} from '@/types/teamDashboard';

/**
 * Hook for Team Dashboard with data transformation for charts
 */
export function useTeamDashboardData(teamId: number) {
    const { data: rawData, loading, error, refresh, forceRefresh } = useTeamDashboard(teamId);

    // Return data in the format expected by the page
    const data = rawData ? {
        teamStats: rawData.teamStats,
        memberBreakdown: rawData.memberBreakdown,
        projectBreakdown: rawData.projectBreakdown,
        upcomingDeadlines: rawData.upcomingDeadlines,
        teamPerformance: rawData.teamPerformance
    } : null;

    // Transform data for charts
    const chartData = {
        roleDonutData: data?.memberBreakdown?.byRole?.map(role => ({
            label: role.name,
            value: role.count,
            color: 'rgb(184, 172, 255)'
        })) || [],

        workloadBarData: data?.memberBreakdown?.byWorkload?.map(member => ({
            label: member.name,
            value: member.count,
            color: 'rgb(184, 172, 255)'
        })) || [],

        projectStatusDonutData: data?.projectBreakdown?.byStatus?.map(status => ({
            label: status.name,
            value: status.count,
            color: 'rgb(184, 172, 255)'
        })) || [],

        performanceTrends: {
            labels: data?.teamPerformance?.monthlyTrends?.map(trend => trend.month) || [],
            datasets: [
                {
                    label: 'Tasks Created',
                    data: data?.teamPerformance?.monthlyTrends?.map(trend => trend.tasksCreated) || [],
                    color: 'rgb(59, 130, 246)',
                    fillOpacity: 0.1,
                    tension: 0.4,
                },
                {
                    label: 'Tasks Completed',
                    data: data?.teamPerformance?.monthlyTrends?.map(trend => trend.tasksCompleted) || [],
                    color: 'rgb(184, 172, 255)',
                    fillOpacity: 0.2,
                    tension: 0.4,
                },
            ]
        }
    };

    // Calculate stats for cards
    const stats = data ? [
        {
            label: 'Team Members',
            value: data.teamStats.totalMembers,
            subValue: `${data.teamStats.activeMembers} active`,
            icon: 'Users'
        },
        {
            label: 'Total Projects',
            value: data.teamStats.totalProjects,
            subValue: `${data.teamStats.activeProjects} active`,
            icon: 'FolderOpen'
        },
        {
            label: 'Team Efficiency',
            value: `${data.teamStats.teamEfficiency}%`,
            subValue: `${data.teamStats.avgTasksPerMember} tasks/member avg`,
            icon: 'TrendingUp'
        },
        {
            label: 'Total Tasks',
            value: data.teamStats.totalTasks,
            subValue: `${data.teamStats.completionRate.toFixed(1)}% completed`,
            icon: 'Target'
        },
    ] : [];

    return {
        // Raw data in expected format
        data,
        loading,
        error,
        refresh,
        forceRefresh,

        // Transformed data for UI
        chartData,
        stats,

        // Helper methods
        hasData: !!data,
        isEmpty: !loading && !error && !data
    };
}

/**
 * Hook for Team Members Performance with detailed analytics
 */
export function useTeamMembersPerformance(teamId: number) {
    const [memberData, setMemberData] = useState<MemberBreakdown | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMemberPerformance = async () => {
            try {
                setLoading(true);
                setError(null);

                // This would use the teamDashboardService.getTeamMemberPerformance
                // For now, we'll simulate the API call structure
                const response = await fetch(`/api/teams/${teamId}/members/performance`);
                if (!response.ok) throw new Error('Failed to fetch member performance');

                const data = await response.json();
                setMemberData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchMemberPerformance();
        }
    }, [teamId]);

    // Transform member data for charts
    const memberChartData = {
        roleDistribution: memberData?.byRole?.map(role => ({
            label: role.name,
            value: role.count,
            color: getColorForRole(role.name)
        })) || [],

        workloadDistribution: memberData?.byWorkload?.map(member => ({
            label: member.name,
            value: member.count,
            color: getColorForWorkload(member.count)
        })) || []
    };

    return {
        memberData,
        loading,
        error,
        memberChartData,
        topPerformers: memberData?.byWorkload?.slice(0, 5) || [],
        totalMembers: memberData?.byRole?.reduce((sum, role) => sum + role.count, 0) || 0
    };
}

/**
 * Hook for Team Deadlines Management
 */
export function useTeamDeadlines(teamId: number) {
    const [deadlines, setDeadlines] = useState<UpcomingDeadlines | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDeadlines = async () => {
            try {
                setLoading(true);
                setError(null);

                // This would use the teamDashboardService.getTeamDeadlines
                const response = await fetch(`/api/teams/${teamId}/deadlines`);
                if (!response.ok) throw new Error('Failed to fetch deadlines');

                const data = await response.json();
                setDeadlines(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchDeadlines();
        }
    }, [teamId]);

    // Calculate urgency metrics
    const urgencyMetrics = {
        totalOverdue: deadlines?.overdue?.length || 0,
        thisWeekCount: deadlines?.thisWeek?.length || 0,
        nextWeekCount: deadlines?.nextWeek?.length || 0,
        criticalOverdue: deadlines?.overdue?.filter(task => task.daysOverdue >= 7).length || 0
    };

    return {
        deadlines,
        loading,
        error,
        urgencyMetrics,
        hasUrgentTasks: urgencyMetrics.totalOverdue > 0 || urgencyMetrics.thisWeekCount > 0
    };
}

// Helper functions for color assignment
function getColorForRole(roleName: string): string {
    const roleColors: Record<string, string> = {
        'OWNER': '#dc2626',
        'ADMIN': '#ea580c',
        'MEMBER': '#3b82f6',
        'VIEWER': '#6b7280',
        'Developers': '#10b981',
        'Designers': '#8b5cf6',
        'Project Managers': '#f59e0b',
        'QA Engineers': '#ef4444'
    };

    return roleColors[roleName] || '#6b7280';
}

function getColorForWorkload(taskCount: number): string {
    if (taskCount >= 20) return '#dc2626'; // High workload - red
    if (taskCount >= 15) return '#f59e0b'; // Medium-high workload - amber
    if (taskCount >= 10) return '#3b82f6'; // Medium workload - blue
    if (taskCount >= 5) return '#10b981';  // Low-medium workload - green
    return '#6b7280'; // Low workload - gray
}

/**
 * Hook for Team Performance Analytics
 */
export function useTeamPerformanceAnalytics(teamId: number) {
    const { data, loading, error } = useTeamDashboard(teamId);

    // Calculate performance metrics
    const performanceMetrics = data ? {
        overallScore: calculateOverallPerformanceScore(data.teamStats),
        efficiencyTrend: calculateEfficiencyTrend(data.teamPerformance.monthlyTrends),
        productivityLevel: getProductivityLevel(data.teamStats.teamEfficiency),
        recommendedActions: getRecommendedActions(data.teamStats)
    } : null;

    return {
        performanceMetrics,
        loading,
        error,
        hasPerformanceData: !!performanceMetrics
    };
}

// Helper functions for performance analytics
function calculateOverallPerformanceScore(teamStats: TeamStats): number {
    const completionWeight = 0.4;
    const efficiencyWeight = 0.3;
    const overdueWeight = 0.3;

    const completionScore = (teamStats.completedTasks / teamStats.totalTasks) * 100;
    const efficiencyScore = teamStats.teamEfficiency;
    const overdueScore = Math.max(0, 100 - (teamStats.overdueTasks / teamStats.totalTasks) * 100);

    return Math.round(
        completionScore * completionWeight +
        efficiencyScore * efficiencyWeight +
        overdueScore * overdueWeight
    );
}

function calculateEfficiencyTrend(monthlyTrends: TeamPerformance['monthlyTrends']): 'improving' | 'declining' | 'stable' {
    if (!monthlyTrends || monthlyTrends.length < 2) return 'stable';

    const lastMonth = monthlyTrends[monthlyTrends.length - 1];
    const previousMonth = monthlyTrends[monthlyTrends.length - 2];

    const lastRatio = lastMonth.tasksCompleted / lastMonth.tasksCreated;
    const previousRatio = previousMonth.tasksCompleted / previousMonth.tasksCreated;

    const difference = lastRatio - previousRatio;

    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'declining';
    return 'stable';
}

function getProductivityLevel(efficiency: number): { level: string; color: string } {
    if (efficiency >= 85) return { level: 'Excellent', color: '#10b981' };
    if (efficiency >= 70) return { level: 'Good', color: '#3b82f6' };
    if (efficiency >= 55) return { level: 'Average', color: '#f59e0b' };
    return { level: 'Needs Improvement', color: '#ef4444' };
}

function getRecommendedActions(teamStats: TeamStats): string[] {
    const actions: string[] = [];

    if (teamStats.overdueTasks > teamStats.totalTasks * 0.1) {
        actions.push('Address overdue tasks - consider redistributing workload');
    }

    if (teamStats.teamEfficiency < 70) {
        actions.push('Review team processes to improve efficiency');
    }

    if (teamStats.avgTasksPerMember > 20) {
        actions.push('Consider hiring additional team members or reducing scope');
    }

    if (teamStats.completionRate < 0.6) {
        actions.push('Focus on completing existing tasks before taking on new ones');
    }

    return actions;
}
