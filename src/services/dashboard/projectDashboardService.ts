import { BaseApiClient } from '@/lib/baseApiClient';

export interface ProjectDashboardResponse {
  projectInfo: {
    id: number;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    isPersonal: boolean;
    teamId: number | null;
    currentUserRole: string | null;
    isCurrentUserMember: boolean;
    createdAt: string;
    updatedAt: string;
  };

  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
    teamMembers: number;
    daysRemaining: number;
    projectProgress: number;
    tasksThisWeek: number;
    tasksCompletedThisWeek: number;
  };

  taskBreakdown: {
    byStatus: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    byPriority: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    byAssignee: Array<{
      userId: number;
      name: string;
      email: string;
      count: number;
      completedTasks: number;
      completionRate: number;
    }>;
  };

  upcomingTasks: {
    urgentTasks: TaskSummary[];
    dueTodayTasks: TaskSummary[];
    overdueTasks: TaskSummary[];
    thisWeekTasks: TaskSummary[];
  };

  progressTrends: {
    weeklyProgress: Array<{
      week: string;
      weekStart: string;
      weekEnd: string;
      planned: number;
      completed: number;
      completionRate: number;
    }>;
    dailyProgress: Array<{
      date: string;
      tasksCompleted: number;
      tasksCreated: number;
      tasksInProgress: number;
    }>;
    velocity: {
      averageTasksPerWeek: number;
      averageTasksPerDay: number;
      estimatedDaysToCompletion: number;
      estimatedCompletionDate: string | null;
    };
  };

  teamInfo: {
    teamId: number | null;
    teamName: string;
    members: Array<{
      userId: number;
      name: string;
      email: string;
      role: string;
      assignedTasks: number;
      completedTasks: number;
      workload: number;
    }>;
    totalMembers: number;
  };
}

interface TaskSummary {
  id: number;
  title: string;
  status: string;
  priority: string;
  deadline: string | null;
  assigneeName: string;
  assigneeEmail: string;
  assigneeId: number | null;
  daysOverdue: number;
  isOverdue: boolean;
  isUrgent: boolean;
}

/**
 * Dashboard API Service
 */
export class ProjectDashboardService {
  /**
   * Get comprehensive project dashboard data
   */
  async getProjectDashboard(projectId: string): Promise<ProjectDashboardResponse> {
    try {
      const response = await BaseApiClient.get<ProjectDashboardResponse>(`/api/projects/${projectId}/dashboard`);
      return response;
    } catch (error) {
      throw new Error('Failed to load project dashboard data');
    }
  }

  /**
   * Clear cache and refresh dashboard
   */
  async clearCache(): Promise<void> {
    try {
      // If you have cache clearing endpoint
      // await BaseApiClient.delete(`/api/projects/cache`);
    } catch (error) {
      throw new Error('Failed to clear cache');
    }
  }

  /**
   * Get dashboard overview (legacy method for compatibility)
   */
  async getOverview() {
    throw new Error('getOverview is deprecated, use getProjectDashboard instead');
  }

  /**
   * Get task stats (legacy method for compatibility)
   */
  async getTaskStats() {
    throw new Error('getTaskStats is deprecated, use getProjectDashboard instead');
  }

  /**
   * Get upcoming tasks (legacy method for compatibility)
   */
  async getUpcomingTasks() {
    throw new Error('getUpcomingTasks is deprecated, use getProjectDashboard instead');
  }
}

// Export singleton instance
export const dashboardService = new ProjectDashboardService();
