import { useMemo, useCallback } from 'react';
import { useMyTasksSummary, useUpdateTask, useUpdateTaskStatus, useCreateTask, useDeleteTask } from './index';
import { useTasksContext } from '@/contexts/TasksContext';
import { CookieAuth } from '@/utils/cookieAuth';
import type { Task, CreateTaskDTO } from '@/types';
import type { TaskListItem, TaskStatus } from '@/components/TaskList/types';

interface UseMyTasksSharedParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  searchValue?: string;
}

interface MyTasksSharedReturn {
  // Data
  tasks: Task[];
  taskListItems: TaskListItem[];
  filteredTasks: Task[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error handling
  error: Error | null;
  
  // Actions
  actions: {
    onTaskClick: (task: TaskListItem | Task) => void;
    onTaskEdit: (task: TaskListItem) => Promise<void>;
    onTaskComplete: (task: TaskListItem) => Promise<void>;
    onCreateTask: (taskData: any) => Promise<void>;
    onTaskDelete: (taskId: string) => Promise<void>;
    onTaskStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
    onTaskAssign: (taskId: string, assigneeId: string) => Promise<void>;
    onBulkAction: (taskIds: string[], action: string) => Promise<void>;
    onDateClick: (dateStr: string) => Promise<void>;
    onTaskDrop: (task: Task, newDate: Date) => Promise<void>;
    onTaskResize: (task: Task, newStartDate: Date, newEndDate: Date) => Promise<void>;
  };
  
  // Utilities
  revalidate: () => void;
  convertTaskToTaskListItem: (task: Task) => TaskListItem;
}

export const useMyTasksShared = (params: UseMyTasksSharedParams = {}): MyTasksSharedReturn => {
  const {
    page = 0,
    size = 1000,
    sortBy = 'startDate',
    sortDir = 'desc',
    searchValue = ''
  } = params;

  // Get UI state from context
  const { setSelectedTaskId } = useTasksContext();
  
  // SWR data fetching
  const { tasks, isLoading, error, revalidate } = useMyTasksSummary({
    page,
    size,
    sortBy,
    sortDir
  });
  
  // SWR mutation hooks
  const { updateTask, isUpdating } = useUpdateTask();
  const { updateTaskStatus, isUpdating: isUpdatingStatus } = useUpdateTaskStatus();
  const { deleteTask, isDeleting } = useDeleteTask();
  const { createTask, isCreating } = useCreateTask();

  // Helper function to format dates consistently
  const formatDate = useCallback((date: Date | string | null | undefined) => {
    if (!date) return undefined;
    if (typeof date === 'string') return date;
    if (date instanceof Date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    return undefined;
  }, []);

  // Convert Task to TaskListItem - Memoized for performance
  const convertTaskToTaskListItem = useCallback((task: Task): TaskListItem => {
    return {
      id: task.id.toString(),
      name: task.title,
      description: task.description || '',
      assignees: task.creatorName ? [{
        id: 'creator',
        name: task.creatorName,
        email: '',
      }] : [],
      dueDate: task.dueDate && task.dueDate !== 'No deadline' ? task.dueDate : undefined,
      startDate: formatDate(task.startDate),
      deadline: formatDate(task.endDate),
      startTime: '',
      endTime: '',
      hasStartTime: false,
      hasEndTime: false,
      priority: (task.priority as any) || 'MEDIUM',
      status: task.status === 'DONE' ? 'DONE' : 
              task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO',
      tags: task.tags || [],
      project: task.tagText || 'Default Project',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }, [formatDate]);

  // Transform tasks to TaskListItem format - Memoized
  const taskListItems = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.map(convertTaskToTaskListItem);
  }, [tasks, convertTaskToTaskListItem]);

  // Filter tasks based on search - Memoized
  const filteredTasks = useMemo(() => {
    if (!searchValue.trim()) return tasks;
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [tasks, searchValue]);

  // Shared task actions
  const actions = useMemo(() => ({
    onTaskClick: (task: TaskListItem | Task) => {
      const taskId = typeof task.id === 'string' ? task.id : task.id.toString();
      setSelectedTaskId(taskId);
      console.log('Task clicked:', task);
    },
    
    onTaskEdit: async (task: TaskListItem) => {
      try {
        // Determine if this is a project task or personal task
        const isProjectTask = task.project && task.project !== 'Default Project';
        
        if (isProjectTask) {
          // Use project task API for project tasks
          const projectTaskService = await import('@/services/tasks/projectTaskService');
          const backendData = {
            title: task.name,
            description: task.description || '',
            status: task.status === 'DONE' ? 'DONE' : 
                   task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 
                   task.status === 'REVIEW' ? 'REVIEW' : 'TODO',
            priority: task.priority === 'LOW' ? 'LOW' :
                     task.priority === 'MEDIUM' ? 'MEDIUM' :
                     task.priority === 'HIGH' ? 'HIGH' : 'URGENT',
            startDate: task.startDate || new Date().toISOString().split('T')[0],
            deadline: task.deadline || task.dueDate || undefined,
          };
          
          await projectTaskService.projectTaskService.updateTask(
            parseInt(task.id), 
            backendData as any
          );
        } else {
          // Use personal task API for my-tasks
          const backendData = {
            title: task.name,
            description: task.description || '',
            status: task.status === 'DONE' ? 'DONE' : 
                   task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 
                   task.status === 'REVIEW' ? 'REVIEW' : 'TODO',
            priority: task.priority === 'LOW' ? 'LOW' :
                     task.priority === 'MEDIUM' ? 'MEDIUM' :
                     task.priority === 'HIGH' ? 'HIGH' : 'URGENT',
            startDate: task.startDate || new Date().toISOString().split('T')[0],
            deadline: task.deadline || task.dueDate || undefined,
            groupId: undefined,
            projectId: undefined,
            assignedToIds: task.assignees.map(a => parseInt(a.id)).filter(id => !isNaN(id)),
          };
          
          await updateTask({ 
            id: task.id, 
            data: backendData
          });
        }
        
        // Revalidate data after edit
        revalidate();
      } catch (error) {
        console.error('Failed to update task:', error);
        throw error;
      }
    },

    onTaskComplete: async (task: TaskListItem) => {
      try {
        // Determine if this is a project task or personal task
        const isProjectTask = task.project && task.project !== 'Default Project';
        
        if (isProjectTask) {
          // Use project task API for project tasks
          const projectTaskService = await import('@/services/tasks/projectTaskService');
          const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
          await projectTaskService.projectTaskService.updateTaskStatus(
            parseInt(task.id), 
            newStatus
          );
        } else {
          // Use personal task API for my-tasks
          const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
          await updateTaskStatus({ 
            id: task.id, 
            status: newStatus
          });
        }
        
        // Revalidate data after status change
        revalidate();
      } catch (error) {
        console.error('Failed to toggle task completion:', error);
        throw error;
      }
    },
    
    onCreateTask: async (taskData: Record<string, unknown>) => {
      try {
        const backendData = {
          title: taskData.name || 'New Task',
          description: taskData.description || '',
          status: taskData.status === 'DONE' ? 'DONE' : 
                 taskData.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 
                 taskData.status === 'REVIEW' ? 'REVIEW' : 'TODO',
          priority: taskData.priority === 'LOW' ? 'LOW' :
                   taskData.priority === 'MEDIUM' ? 'MEDIUM' :
                   taskData.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
          startDate: taskData.startDate || new Date().toISOString().split('T')[0],
          deadline: taskData.dueDate || taskData.endDate || null,
          groupId: taskData.groupId || null,
          projectId: taskData.projectId || null,
          creatorId: taskData.creatorId || null,
          assignedToIds: taskData.assignedToIds || [],
        };
        
        await createTask(backendData);
      } catch (error) {
        console.error('Failed to create task:', error);
        throw error;
      }
    },
    
    onTaskDelete: async (taskId: string) => {
      try {
        // Find the task to determine if it's a project task or personal task
        const task = taskListItems.find(t => t.id === taskId);
        const isProjectTask = task?.project && task.project !== 'Default Project';
        
        if (isProjectTask) {
          // Use project task API for project tasks
          const projectTaskService = await import('@/services/tasks/projectTaskService');
          await projectTaskService.projectTaskService.deleteTask(parseInt(taskId));
        } else {
          // Use personal task API for my-tasks
          await deleteTask(taskId);
        }
        
        // Revalidate data after deletion
        revalidate();
      } catch (error) {
        console.error('Failed to delete task:', error);
        throw error;
      }
    },
    
    onTaskStatusChange: async (taskId: string, status: TaskStatus) => {
      try {
        const backendStatus = status === 'DONE' ? 'DONE' : 
                            status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 
                            status === 'REVIEW' ? 'REVIEW' : 'TODO';
        
        // ✅ FIX: Use updateTaskStatus instead of updateTask for status changes
        await updateTaskStatus({ 
          id: taskId, 
          status: backendStatus
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
        throw error;
      }
    },
    
    onTaskAssign: async (taskId: string, assigneeId: string) => {
      try {
        const backendData = {
          assignedToIds: [assigneeId],
          startDate: new Date().toISOString().split('T')[0]
        };
        
        await updateTask({ 
          id: taskId, 
          data: backendData
        });
      } catch (error) {
        console.error('Failed to assign task:', error);
        throw error;
      }
    },
    
    onBulkAction: async (taskIds: string[], action: 'delete' | 'complete') => {
      try {
        if (action === 'delete') {
          await Promise.all(taskIds.map(id => deleteTask(id)));
        } else if (action === 'complete') {
          await Promise.all(taskIds.map(id => 
            updateTask({ id, data: { status: 'COMPLETED' } })
          ));
        }
      } catch (error) {
        console.error(`Failed to bulk ${action} tasks:`, error);
        throw error;
      }
    },

    // Calendar-specific actions
    onDateClick: async (dateStr: string) => {
      // ✅ FIX: Prevent duplicate execution
      if (actions.onDateClick.isCreating) {

        return;
      }
      actions.onDateClick.isCreating = true;
      
      try {
        const tokenPayload = CookieAuth.getTokenPayload();
        const userInfo = CookieAuth.getUserInfo();
      
      const dateParts = dateStr.split('-');
      const selectedDate = new Date(
        parseInt(dateParts[0]), 
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]),
        12, 0, 0, 0
      );
      
      const taskData: CreateTaskDTO = {
        title: 'New Task',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        startDate: dateStr,
        deadline: dateStr,
        dueDate: dateStr,
        dueDateISO: selectedDate,
        creatorId: tokenPayload?.userId || parseInt(userInfo.id || '1'),
        assignedToIds: [],
        projectId: null,
        groupId: null,
      };
      
          const newTask = await createTask(taskData);
          return newTask;
        } catch (error) {
          console.error('Failed to create task on date click:', error);
          throw error;
        } finally {
          // Reset flag after completion
          actions.onDateClick.isCreating = false;
        }
      },

    onTaskDrop: async (task: Task, newDate: Date) => {
      const localDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 12, 0, 0, 0);
      const simpleDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      
      try {
        await updateTask({ 
          id: task.id.toString(), 
          data: { deadline: simpleDate }
        });
        setTimeout(() => revalidate(), 100);
      } catch (error) {
        console.error('Failed to drop task:', error);
        revalidate();
        throw error;
      }
    },

    onTaskResize: async (task: Task, newStartDate: Date, newEndDate: Date) => {
      const formatDate = (date: Date) => {
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
        return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      };

      try {
        await updateTask({ 
          id: task.id.toString(), 
          data: {
            startDate: formatDate(newStartDate),
            deadline: formatDate(newEndDate),
          }
        });
      } catch (error) {
        console.error('Failed to resize task:', error);
        revalidate();
        throw error;
      }
    },
  }), [updateTask, createTask, deleteTask, setSelectedTaskId, revalidate]);

  return {
    // Data
    tasks: tasks || [],
    taskListItems,
    filteredTasks: filteredTasks || [],
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error handling
    error,
    
    // Actions
    actions,
    
    // Utilities
    revalidate,
    convertTaskToTaskListItem,
  };
};