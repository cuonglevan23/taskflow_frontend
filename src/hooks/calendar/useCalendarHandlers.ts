// Custom hook for calendar event handlers
import { useCallback } from 'react';
import { TaskListItem } from '@/components/TaskList/types';

interface UseCalendarHandlersProps {
  projectId?: string;
  projectName?: string;
  onEventClick?: (task: any) => void;
  onDateClick?: (dateStr: string) => void;
  onEventDrop?: (taskId: string, newDateStr: string) => void;
  onEventResize?: (taskId: string, newStartDate: string, newEndDate: string) => void;
  onTaskCreate?: (taskData: any) => void;
  openTaskDetail: (task: TaskListItem) => void;
}

export const useCalendarHandlers = ({
  projectId,
  projectName,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  onTaskCreate,
  openTaskDetail,
}: UseCalendarHandlersProps) => {

  // Convert task to TaskListItem format for detail panel
  const convertToTaskListItem = useCallback((task: any): TaskListItem => {
    return {
      id: task.id.toString(),
      name: task.title || task.name,
      description: task.description || '',
      assignees: task.assignees || [],
      assigneeId: task.assigneeId,
      assigneeName: task.assigneeName,
      assigneeEmail: task.assigneeEmail,
      additionalAssignees: task.additionalAssignees || [],
      dueDate: task.deadline,
      deadline: task.deadline,
      startDate: task.startDate,
      endDate: task.deadline,
      priority: task.priority as any || 'MEDIUM',
      status: task.status as any || 'TODO',
      tags: task.tags || [],
      project: task.projectName || projectName || '',
      projectName: task.projectName || projectName || '',
      projectId: task.projectId || (projectId ? Number(projectId) : undefined),
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      completed: task.status === 'DONE',
      progressPercentage: task.progressPercentage || 0,
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
    };
  }, [projectName, projectId]);

  // Task event handlers
  const handleEventClick = useCallback((task: any) => {
    const taskListItem = convertToTaskListItem(task);
    openTaskDetail(taskListItem);
    onEventClick?.(task);
  }, [convertToTaskListItem, openTaskDetail, onEventClick]);

  const handleDateClick = useCallback(async (dateStr: string) => {
    try {
      // Create default task for project
      const taskData = {
        name: `New Task - ${dateStr}`,
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        startDate: dateStr,
        deadline: dateStr,
        projectId,
      };

      // Use onDateClick handler if provided, otherwise fallback to onTaskCreate
      if (onDateClick) {
        await onDateClick(dateStr);
      } else if (onTaskCreate) {
        await onTaskCreate(taskData);
      }

    } catch (error) {
      console.error('❌ Project Calendar: Failed to create task:', error);
    }
  }, [projectId, onDateClick, onTaskCreate]);

  const handleEventDrop = useCallback(async (taskId: string, newDateStr: string) => {
    try {
      await onEventDrop?.(taskId, newDateStr);
    } catch (error) {
      console.error('❌ Project Calendar: Failed to move task:', error);
    }
  }, [onEventDrop]);

  const handleEventResize = useCallback(async (taskId: string, newStartDate: string, newEndDate: string) => {
    try {
      await onEventResize?.(taskId, newStartDate, newEndDate);
    } catch (error) {
      console.error('❌ Project Calendar: Failed to resize task:', error);
    }
  }, [onEventResize]);

  return {
    handleEventClick,
    handleDateClick,
    handleEventDrop,
    handleEventResize,
  };
};
