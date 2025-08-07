"use client";

import { TaskListActions, TaskListItem, TaskStatus } from '@/components/TaskList/types';
import { useProjectBoard } from '../context/ProjectBoardContext';

export function useProjectBoardActions(): TaskListActions {
  const {
    addTask,
    updateTask,
    deleteTask,
    openTaskPanel,
    setSelectedTask,
  } = useProjectBoard();

  const actions: TaskListActions = {
    onTaskClick: (task: TaskListItem) => {
      openTaskPanel(task);
    },

    onTaskEdit: (task: TaskListItem) => {
      openTaskPanel(task);
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
      if (typeof taskData === 'string') {
        // Simple string task creation
        await addTask({
          name: taskData,
          description: '',
          assignees: [],
          priority: 'medium',
          status: 'todo',
          tags: [],
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
          dueDate: taskData.dueDate,
          startDate: taskData.startDate,
          endDate: taskData.endDate,
          startTime: taskData.startTime,
          endTime: taskData.endTime,
          hasStartTime: taskData.hasStartTime,
          hasEndTime: taskData.hasEndTime,
          project: taskData.project,
        });
      } else {
        // Default task creation
        await addTask({
          name: 'New Task',
          description: '',
          assignees: [],
          priority: 'medium',
          status: 'todo',
          tags: [],
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