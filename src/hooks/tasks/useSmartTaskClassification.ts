import { TaskListItem, TaskActionTime } from '@/components/TaskList/types';
import { useCallback, useMemo } from 'react';

/**
 * Smart task classification hook based on Asana/GTD principles - Memoized for performance
 */
export const useSmartTaskClassification = () => {
  
  /**
   * Get suggested action time based on due date and GTD principles - Memoized
   */
  const getSuggestedActionTime = useCallback((task: TaskListItem): TaskActionTime => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get start of next week (Monday)
    const nextWeek = new Date(today);
    const daysUntilMonday = (7 - today.getDay() + 1) % 7;
    nextWeek.setDate(today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    // Get end of next week (Sunday)  
    const endOfNextWeek = new Date(nextWeek);
    endOfNextWeek.setDate(nextWeek.getDate() + 6);
    const endOfNextWeekStr = endOfNextWeek.toISOString().split('T')[0];

    // Classification logic
    if (task.dueDate) {
      // Overdue or due today → "Do today" (urgent)
      if (task.dueDate <= todayStr) {
        return 'do-today';
      }
      
      // Due in next week → "Do next week"
      if (task.dueDate >= nextWeekStr && task.dueDate <= endOfNextWeekStr) {
        return 'do-next-week';
      }
      
      // Due in far future → "Do later"
      if (task.dueDate > endOfNextWeekStr) {
        return 'do-later';
      }
    }

    // No due date → default classification
    // New tasks (recently created) → "Recently assigned" 
    const createdDate = new Date(task.createdAt);
    const daysSinceCreated = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated <= 2) { // Created within last 2 days
      return 'recently-assigned';
    }

    // Old tasks without due date → "Do later"
    return 'do-later';
  }, []);

  /**
   * Get actual action time (user override or suggested) - Memoized
   */
  const getActualActionTime = useCallback((task: TaskListItem): TaskActionTime => {
    // If user has manually set actionTime, respect that (user override)
    const manualActionTime = (task as any).actionTime;
    if (manualActionTime && ['recently-assigned', 'do-today', 'do-next-week', 'do-later'].includes(manualActionTime)) {
      return manualActionTime;
    }

    // Otherwise use smart suggestion
    return getSuggestedActionTime(task);
  }, [getSuggestedActionTime]);

  /**
   * Check if task is in suggested bucket vs manually moved - Memoized
   */
  const isTaskInSuggestedBucket = useCallback((task: TaskListItem): boolean => {
    const manualActionTime = (task as any).actionTime;
    const suggestedActionTime = getSuggestedActionTime(task);
    
    // If no manual override, it's following suggestion
    if (!manualActionTime) return true;
    
    // If manual override matches suggestion, it's still "suggested"
    return manualActionTime === suggestedActionTime;
  }, [getSuggestedActionTime]);

  /**
   * Get bucket info with smart descriptions - Memoized
   */
  const getBucketInfo = useMemo(() => (bucketId: TaskActionTime, taskCount: number) => {
    const bucketConfigs = {
      'recently-assigned': {
        title: 'Recently assigned',
        description: `Mới được giao (${taskCount})`,
        subtitle: 'Inbox - duyệt và phân loại task mới',
        color: '#6B7280',
        icon: '📥',
      },
      'do-today': {
        title: 'Do today', 
        description: `Làm hôm nay (${taskCount})`,
        subtitle: 'Task cần hoàn thành trong ngày',
        color: '#DC2626',
        icon: '🔴',
      },
      'do-next-week': {
        title: 'Do next week',
        description: `Làm tuần sau (${taskCount})`,
        subtitle: 'Task có thể để tuần tới - tickler file',
        color: '#F59E0B', 
        icon: '🟡',
      },
      'do-later': {
        title: 'Do later',
        description: `Để sau (${taskCount})`,
        subtitle: 'Backlog - chưa cần thiết ngay',
        color: '#10B981',
        icon: '🟢',
      },
    };

    return bucketConfigs[bucketId];
  }, []);

  return {
    getSuggestedActionTime,
    getActualActionTime,
    isTaskInSuggestedBucket,
    getBucketInfo,
  };
};