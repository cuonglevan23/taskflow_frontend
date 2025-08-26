import { useMemo, useCallback, useRef } from 'react';
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
    onCreateTask: (taskData: Record<string, unknown>) => Promise<void>;
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
  const { updateTaskStatus } = useUpdateTaskStatus();
  const { deleteTask, isDeleting } = useDeleteTask();
  const { createTask, isCreating } = useCreateTask();

  // Static flag to prevent duplicate date clicks
  const dateClickInProgress = useRef(false);

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
    let assignees: Array<{id: string; name: string; email: string; avatar?: string}> = [];

    // Convert profile information to assignees format for TaskList component
    if (task.assigneeProfiles && task.assigneeProfiles.length > 0) {
      assignees = task.assigneeProfiles.map(profile => ({
        id: profile.userId.toString(),
        name: profile.displayName || `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        avatar: profile.avatarUrl,
      }));
    }

    // Add creator as assignee if no other assignees (for display purposes)
    if (assignees.length === 0 && task.creatorProfile) {
      assignees = [{
        id: task.creatorProfile.userId.toString(),
        name: task.creatorProfile.displayName || `${task.creatorProfile.firstName} ${task.creatorProfile.lastName}`.trim(),
        email: task.creatorProfile.email,
        avatar: task.creatorProfile.avatarUrl,
      }];
    }

    const taskListItem: TaskListItem = {
      id: task.id.toString(),
      name: task.title,
      description: task.description || '',
      assignees: assignees,
      // Map assignedEmails field for email assignment display
      assignedEmails: task.assignedEmails || [],
      dueDate: task.dueDate && task.dueDate !== 'No deadline' ? task.dueDate : undefined,
      startDate: formatDate(task.startDate),
      deadline: formatDate(task.deadline),
      startTime: '',
      endTime: '',
      hasStartTime: false,
      hasEndTime: false,
      priority: (task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') || 'MEDIUM',
      status: (task.status === 'DONE' ? 'DONE' : 
              task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO') as TaskStatus,
      completed: task.completed || task.status === 'DONE', // ✅ FIX: Use both completed field and status check
      tags: task.tags || [],
      project: task.tagText || 'Default Project',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };

    return taskListItem;
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
            status: (task.status === 'DONE' ? 'DONE' : 
                   task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 
                   task.status === 'REVIEW' ? 'REVIEW' : 'TODO') as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
            priority: (task.priority === 'LOW' ? 'LOW' :
                     task.priority === 'MEDIUM' ? 'MEDIUM' :
                     task.priority === 'HIGH' ? 'HIGH' : 'CRITICAL') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
            startDate: task.startDate || new Date().toISOString().split('T')[0],
            deadline: task.deadline || task.dueDate || undefined,
          };
          
          await projectTaskService.projectTaskService.updateTask(
            parseInt(task.id), 
            backendData
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
      console.log('🚀 useMyTasksShared.onCreateTask called with:', taskData);
      try {
        // Get user information for proper task creation
        const tokenPayload = CookieAuth.getTokenPayload();
        const userInfo = CookieAuth.getUserInfo();
        console.log('👤 User info:', { tokenPayload, userInfo });
        
        // Get current date for task
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Map actionTime to due date (for bucket-based creation)
        let dueDate = todayStr;
        let dueDateISO = today;
        
        if (taskData.actionTime) {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          const later = new Date(today);
          later.setDate(today.getDate() + 14);
          
          switch (taskData.actionTime) {
            case 'do-today':
              dueDate = todayStr;
              dueDateISO = today;
              break;
            case 'do-next-week':
              dueDate = nextWeek.toISOString().split('T')[0];
              dueDateISO = nextWeek;
              break;
            case 'do-later':
              dueDate = later.toISOString().split('T')[0];
              dueDateISO = later;
              break;
            case 'recently-assigned':
            default:
              dueDate = todayStr;
              dueDateISO = today;
              break;
          }
        }

        // Create proper CreateTaskDTO object like calendar does
        const createTaskDto: CreateTaskDTO = {
          title: (taskData.name as string) || 'New Task',
          description: (taskData.description as string) || '',
          status: taskData.status === 'DONE' ? 'DONE' : 
                 taskData.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 
                 taskData.status === 'REVIEW' ? 'REVIEW' : 'TODO',
          priority: taskData.priority === 'LOW' ? 'LOW' :
                   taskData.priority === 'MEDIUM' ? 'MEDIUM' :
                   taskData.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
          startDate: (taskData.startDate as string) || todayStr,
          deadline: (taskData.deadline as string) || dueDate,
          dueDate: (taskData.dueDate as string) || dueDate,
          dueDateISO: dueDateISO,
          groupId: (taskData.groupId as number) || undefined,
          projectId: (taskData.projectId as number) || undefined,
          creatorId: (taskData.creatorId as number) || tokenPayload?.userId || parseInt(userInfo.id || '1'),
          assignedToIds: (taskData.assignedToIds as number[]) || [],
        };
        
        console.log('📝 CreateTaskDTO prepared:', createTaskDto);
        
        // Use the same createTask method as calendar
        console.log('🔄 Calling createTask...');
        await createTask(createTaskDto);
        console.log('✅ Task created successfully');
        
        // Revalidate data after creation
        revalidate();
        console.log('🔄 Data revalidated');
      } catch (error) {
        console.error('❌ Failed to create task in useMyTasksShared:', error);
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
    
    onTaskStatusChange: async (taskId: string, status: TaskStatus | string) => {
      try {
        // ✅ FIX: Use same approach as MyTasksCard - use updateTask instead of updateTaskStatus
        const backendStatus = status.toString().toLowerCase() === 'completed' ? 'completed' : 'todo';
        
        // ✅ FIX: Use updateTask like MyTasksCard does
        await updateTask({ 
          id: taskId, 
          data: { status: backendStatus }
        });
        
        // ✅ FIX: Revalidate data after status change
        revalidate();
      } catch (error) {
        console.error('Failed to update task status:', error);
        throw error;
      }
    },
    
    onTaskAssign: async (taskId: string, assigneeId: string) => {
      try {
        const backendData = {
          assignedToIds: [parseInt(assigneeId)].filter(id => !isNaN(id)),
          startDate: new Date().toISOString().split('T')[0]
        };
        
        await updateTask({ 
          id: taskId, 
          data: backendData
        });
        
        // ✅ FIX: Revalidate data after assignment
        revalidate();
      } catch (error) {
        console.error('Failed to assign task:', error);
        throw error;
      }
    },
    
    onBulkAction: async (taskIds: string[], action: string) => {
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
      // Simple duplicate prevention using ref
      if (dateClickInProgress.current) {
        return;
      }
      dateClickInProgress.current = true;
      
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
        projectId: undefined,
        groupId: undefined,
      };
      
          await createTask(taskData);
        } catch (error) {
          console.error('Failed to create task on date click:', error);
          throw error;
        } finally {
          // Reset flag after completion
          dateClickInProgress.current = false;
        }
      },

    onTaskDrop: async (task: Task, newDate: Date) => {
      const newStartDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 12, 0, 0, 0);
      const newStartStr = `${newStartDate.getFullYear()}-${String(newStartDate.getMonth() + 1).padStart(2, '0')}-${String(newStartDate.getDate()).padStart(2, '0')}`;
      
      try {
        // Simple logic: calculate offset and move both dates
        const originalStart = task.startDate ? new Date(task.startDate) : null;
        const originalDeadline = task.deadline ? new Date(task.deadline) : null;
        
        if (originalStart && originalDeadline) {
          // Calculate how many days the task was moved
          const offsetDays = Math.floor((newStartDate.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24));
          
          // Move deadline by same offset
          const newDeadlineDate = new Date(originalDeadline);
          newDeadlineDate.setDate(newDeadlineDate.getDate() + offsetDays);
          const newDeadlineStr = `${newDeadlineDate.getFullYear()}-${String(newDeadlineDate.getMonth() + 1).padStart(2, '0')}-${String(newDeadlineDate.getDate()).padStart(2, '0')}`;
          
          console.log('� Moving task:', {
            taskId: task.id,
            offsetDays,
            from: { start: task.startDate, deadline: task.deadline },
            to: { start: newStartStr, deadline: newDeadlineStr }
          });
          
          await updateTask({ 
            id: task.id.toString(), 
            data: { 
              startDate: newStartStr,
              deadline: newDeadlineStr
            }
          });
        } else {
          // Single date task
          await updateTask({ 
            id: task.id.toString(), 
            data: { 
              startDate: newStartStr,
              deadline: newStartStr
            }
          });
        }
        
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
  }), [updateTask, updateTaskStatus, createTask, deleteTask, setSelectedTaskId, revalidate, taskListItems]);

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