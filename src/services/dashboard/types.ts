// Dashboard service types and interfaces
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksThisMonth: number;
  tasksCompletedThisMonth: number;
}

export interface TaskBreakdownItem {
  id: number;
  name: string;
  count: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export interface TaskBreakdown {
  byProject: TaskBreakdownItem[];
  byTeam: TaskBreakdownItem[];
  byStatus: Array<{ name: string; count: number }>;
  byPriority: Array<{ name: string; count: number }>;
}

export interface TaskItem {
  id: number;
  title: string;
  status: string;
  priority: string;
  deadline: string;
  projectName: string;
  teamName: string | null;
  daysOverdue: number | null;
}

export interface UpcomingTasks {
  nextWeek: number;
  nextMonth: number;
  urgentTasks: TaskItem[];
  dueTodayTasks: TaskItem[];
  overdueTasks: TaskItem[];
}

export interface MonthlyTrend {
  month: string;
  monthName: string;
  created: number;
  completed: number;
  completionRate: number;
}

export interface CompletionTrends {
  monthlyTrends: MonthlyTrend[];
  weeklyTrends: any[];
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}

export interface CacheInfo {
  fromCache: boolean;
  cacheGeneratedAt: string;
  cacheKey: string;
  cacheExpiresInSeconds: number;
}

export interface DashboardOverviewResponse {
  taskStats: TaskStats;
  taskBreakdown: TaskBreakdown;
  upcomingTasks: UpcomingTasks;
  completionTrends: CompletionTrends;
  cacheInfo: CacheInfo;
}

// Dashboard hook result type
export interface DashboardHookResult {
  data: DashboardOverviewResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}
