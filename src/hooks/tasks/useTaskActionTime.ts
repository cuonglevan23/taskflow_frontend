import { useState, useCallback } from 'react';
import { TaskActionTime, TaskListItem } from '@/components/TaskList/types';
import { useUpdateTask } from './useTasksActions';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';

/**
 * Hook for managing personal action time buckets
 * This is separate from task deadlines - allows personal priority management
 */
export const useTaskActionTime = () => {
  const { updateTask, isUpdating } = useUpdateTask();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, TaskActionTime>>(new Map());

  const moveTaskToActionTime = useCallback(async (taskId: string, actionTime: TaskActionTime) => {
    // Optimistic update - immediate UI feedback
    setOptimisticUpdates(prev => new Map(prev).set(taskId, actionTime));

    try {
      // Update task with new action time (doesn't affect deadline/due date)
      await updateTask({
        id: taskId,
        data: {
          actionTime, // Only update personal action time
          // Explicitly do NOT update dueDate or startDate - these remain unchanged
        }
      });

      // Clear optimistic update on success
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      throw error;
    }
  }, [updateTask]);

  const getTaskActionTime = useCallback((task: TaskListItem): TaskActionTime => {
    // Check optimistic updates first
    const optimisticValue = optimisticUpdates.get(task.id);
    if (optimisticValue) {
      return optimisticValue;
    }

    // Return actual value or default to recently-assigned
    return task.actionTime || 'recently-assigned';
  }, [optimisticUpdates]);

  const groupTasksByActionTime = useCallback((tasks: TaskListItem[]) => {
    const groups: Record<TaskActionTime, TaskListItem[]> = {
      'recently-assigned': [],
      'do-today': [],
      'do-next-week': [],
      'do-later': [],
    };

    tasks.forEach(task => {
      const actionTime = getTaskActionTime(task);
      groups[actionTime].push(task);
    });

    return groups;
  }, [getTaskActionTime]);

  const bulkMoveToActionTime = useCallback(async (taskIds: string[], actionTime: TaskActionTime) => {
    // Optimistic updates for all tasks
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      taskIds.forEach(id => newMap.set(id, actionTime));
      return newMap;
    });

    try {
      // Update all tasks in parallel
      await Promise.all(
        taskIds.map(id => 
          updateTask({
            id,
            data: { actionTime }
          })
        )
      );

      // Clear optimistic updates on success
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        taskIds.forEach(id => newMap.delete(id));
        return newMap;
      });
    } catch (error) {
      // Rollback optimistic updates on error
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        taskIds.forEach(id => newMap.delete(id));
        return newMap;
      });
      throw error;
    }
  }, [updateTask]);

  return {
    moveTaskToActionTime,
    getTaskActionTime,
    groupTasksByActionTime,
    bulkMoveToActionTime,
    isUpdating,
  };
};

/**
 * Helper function to get action time display info
 */
export const getActionTimeInfo = (actionTime: TaskActionTime, theme?: any, t?: (key: string) => string) => {
  const configs = {
    'recently-assigned': {
      label: t ? t('taskSections.recentlyAssigned.title') : 'Recently assigned',
      description: t ? t('taskSections.recentlyAssigned.description') : 'Tasks recently assigned to you',
      color: theme?.status?.info || '#6B7280',
      icon: '📥',
    },
    'do-today': {
      label: t ? t('taskSections.doToday.title') : 'Do today',
      description: t ? t('taskSections.doToday.description') : 'Tasks you want to handle today',
      color: theme?.status?.error || '#DC2626',
      icon: '🔴',
    },
    'do-next-week': {
      label: t ? t('taskSections.doNextWeek.title') : 'Do next week',
      description: t ? t('taskSections.doNextWeek.description') : 'Tasks for next week',
      color: theme?.status?.warning || '#F59E0B',
      icon: '🟡',
    },
    'do-later': {
      label: t ? t('taskSections.doLater.title') : 'Do later',
      description: t ? t('taskSections.doLater.description') : 'Tasks for later',
      color: theme?.status?.success || '#10B981',
      icon: '🟢',
    },
  };

  return configs[actionTime];
};