// Dashboard utilities and helper functions
import type { TaskStats, TaskBreakdown, CompletionTrends, TaskItem } from './types';

/**
 * Calculate completion percentage
 */
export const calculateCompletionRate = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100 * 10) / 10; // Round to 1 decimal place
};

/**
 * Format completion rate for display
 */
export const formatCompletionRate = (rate: number): string => {
  return `${rate.toFixed(1)}%`;
};

/**
 * Get task priority color
 */
export const getTaskPriorityColor = (priority: string): string => {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return '#ef4444'; // red-500
    case 'MEDIUM':
      return '#f59e0b'; // amber-500
    case 'LOW':
      return '#10b981'; // emerald-500
    default:
      return '#6b7280'; // gray-500
  }
};

/**
 * Get task status color
 */
export const getTaskStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return '#10b981'; // emerald-500
    case 'IN_PROGRESS':
      return '#3b82f6'; // blue-500
    case 'TODO':
      return '#6b7280'; // gray-500
    case 'BLOCKED':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
};

/**
 * Format days overdue
 */
export const formatDaysOverdue = (daysOverdue: number | null): string => {
  if (!daysOverdue || daysOverdue <= 0) return '';
  if (daysOverdue === 1) return '1 day overdue';
  return `${daysOverdue} days overdue`;
};

/**
 * Sort tasks by priority (HIGH -> MEDIUM -> LOW)
 */
export const sortTasksByPriority = (tasks: TaskItem[]): TaskItem[] => {
  const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  return [...tasks].sort((a, b) => {
    const aPriority = priorityOrder[a.priority.toUpperCase() as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority.toUpperCase() as keyof typeof priorityOrder] || 0;
    return bPriority - aPriority;
  });
};

/**
 * Sort tasks by deadline (earliest first)
 */
export const sortTasksByDeadline = (tasks: TaskItem[]): TaskItem[] => {
  return [...tasks].sort((a, b) => {
    const aDate = new Date(a.deadline);
    const bDate = new Date(b.deadline);
    return aDate.getTime() - bDate.getTime();
  });
};

/**
 * Get the most urgent tasks (overdue + high priority + due today)
 */
export const getMostUrgentTasks = (
  urgentTasks: TaskItem[],
  dueTodayTasks: TaskItem[],
  overdueTasks: TaskItem[]
): TaskItem[] => {
  const allUrgent = [
    ...overdueTasks,
    ...urgentTasks.filter(task => task.priority.toUpperCase() === 'HIGH'),
    ...dueTodayTasks.filter(task => task.priority.toUpperCase() === 'HIGH')
  ];

  // Remove duplicates by id
  const uniqueTasks = allUrgent.filter((task, index, self) =>
    index === self.findIndex(t => t.id === task.id)
  );

  return sortTasksByDeadline(uniqueTasks);
};

/**
 * Calculate trend direction for completion rate
 */
export const getTrendDirection = (trends: CompletionTrends): 'up' | 'down' | 'stable' => {
  const monthlyTrends = trends.monthlyTrends;
  if (monthlyTrends.length < 2) return 'stable';

  const latest = monthlyTrends[monthlyTrends.length - 1];
  const previous = monthlyTrends[monthlyTrends.length - 2];

  const diff = latest.completionRate - previous.completionRate;

  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
};

/**
 * Get trend icon based on direction
 */
export const getTrendIcon = (direction: 'up' | 'down' | 'stable'): string => {
  switch (direction) {
    case 'up': return '📈';
    case 'down': return '📉';
    default: return '➡️';
  }
};

/**
 * Calculate productivity score based on completion rate and task volume
 */
export const calculateProductivityScore = (taskStats: TaskStats): number => {
  const { completionRate, totalTasks, tasksThisMonth } = taskStats;

  // Base score from completion rate (0-70 points)
  const completionScore = (completionRate / 100) * 70;

  // Volume bonus (0-30 points)
  const volumeScore = Math.min((tasksThisMonth / 20) * 30, 30);

  return Math.round(completionScore + volumeScore);
};

/**
 * Get productivity level description
 */
export const getProductivityLevel = (score: number): { level: string; color: string; icon: string } => {
  if (score >= 90) return { level: 'Excellent', color: '#10b981', icon: '🚀' };
  if (score >= 75) return { level: 'Great', color: '#3b82f6', icon: '⭐' };
  if (score >= 60) return { level: 'Good', color: '#f59e0b', icon: '👍' };
  if (score >= 40) return { level: 'Fair', color: '#f97316', icon: '📊' };
  return { level: 'Needs Improvement', color: '#ef4444', icon: '📉' };
};

/**
 * Transform task breakdown data for charts
 */
export const transformForChart = (breakdown: TaskBreakdown['byProject'], chartColor: string) => {
  return breakdown.map(item => ({
    label: item.name,
    value: item.count,
    color: chartColor
  }));
};

/**
 * Format cache expiry time
 */
export const formatCacheExpiry = (expiresInSeconds: number): string => {
  if (expiresInSeconds <= 0) return 'Expired';

  const minutes = Math.floor(expiresInSeconds / 60);
  const seconds = expiresInSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};
