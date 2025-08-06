"use client";

import { TaskListActions, TaskListItem, TaskStatus } from '@/components/TaskList/types';
import { useProjectTimeline } from '../context/ProjectTimelineContext';

export function useProjectTimelineActions(): TaskListActions {
  const {
    addTask,
    updateTask,
    deleteTask,
  } = useProjectTimeline();

  const actions: TaskListActions = {
    onTaskClick: (task: TaskListItem) => {
      console.log('Timeline task clicked:', task);
      // Could integrate with task detail panel here
    },

    onTaskEdit: (task: TaskListItem) => {
      console.log('Timeline task edit:', task);
      // Could open task edit modal here
    },

    onTaskDelete: async (taskId: string) => {
      await deleteTask(taskId);
    },

    onTaskStatusChange: async (taskId: string, status: TaskStatus) => {
      await updateTask(taskId, { status });
    },

    onTaskAssign: async (taskId: string, assigneeId: string) => {
      // In a real app, you'd fetch assignee details and update the assignees array
      // For now, we'll just update with a placeholder assignee
      const assignee = {
        id: assigneeId,
        name: 'Assigned User', // This would come from user lookup
        avatar: assigneeId.substring(0, 2).toUpperCase(),
      };
      
      await updateTask(taskId, { 
        assignees: [assignee] // In real app, you might want to add to existing assignees
      });
    },

    onCreateTask: async (taskData?: string | { 
      name: string; 
      dueDate?: string; 
      startDate?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
      hasStartTime?: boolean;
      hasEndTime?: boolean;
      project?: string; 
      status?: TaskStatus;
    }) => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      if (typeof taskData === 'string') {
        // Simple string task creation
        await addTask({
          name: taskData,
          description: '',
          assignees: [],
          priority: 'medium',
          status: 'todo',
          tags: [],
          startDate: today,
          endDate: nextWeek,
          dueDate: nextWeek,
        });
      } else if (taskData) {
        // Enhanced task creation with all details
        await addTask({
          name: taskData.name,
          description: '',
          assignees: [],
          priority: 'medium',
          status: taskData.status || 'todo',
          tags: [],
          dueDate: taskData.dueDate || taskData.endDate || nextWeek,
          startDate: taskData.startDate || today,
          endDate: taskData.endDate || taskData.dueDate || nextWeek,
          startTime: taskData.startTime,
          endTime: taskData.endTime,
          hasStartTime: taskData.hasStartTime,
          hasEndTime: taskData.hasEndTime,
          project: taskData.project,
        });
      } else {
        // Default task creation
        await addTask({
          name: 'New Timeline Task',
          description: '',
          assignees: [],
          priority: 'medium',
          status: 'todo',
          tags: [],
          startDate: today,
          endDate: nextWeek,
          dueDate: nextWeek,
        });
      }
    },

    onBulkAction: async (taskIds: string[], action: string) => {
      switch (action) {
        case 'delete':
          // Delete multiple tasks
          for (const taskId of taskIds) {
            await deleteTask(taskId);
          }
          break;
        case 'complete':
          // Mark multiple tasks as completed
          for (const taskId of taskIds) {
            await updateTask(taskId, { status: 'done' });
          }
          break;
        case 'start':
          // Mark multiple tasks as in progress
          for (const taskId of taskIds) {
            await updateTask(taskId, { status: 'in_progress' });
          }
          break;
        case 'archive':
          // Archive multiple tasks (could implement archive status)
          for (const taskId of taskIds) {
            await updateTask(taskId, { status: 'cancelled' });
          }
          break;
        default:
          console.warn(`Unknown bulk action: ${action}`);
      }
    },
  };

  return actions;
}