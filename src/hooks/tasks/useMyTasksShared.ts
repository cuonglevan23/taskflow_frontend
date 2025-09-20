import { useMemo, useCallback, useRef } from 'react';
import { useMyTasksSummaryData, useUpdateTask, useUpdateTaskStatus, useCreateTask, useDeleteTask } from './index';
import { useTasksContext } from '@/contexts/TasksContext';
import { useAuth } from '@/components/auth/AuthProvider';
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
    onTaskPriorityChange: (taskId: string, priority: string) => Promise<void>;
    onTaskAssign: (taskId: string, assigneeId: string | { id: string; name: string; email: string; avatar?: string }) => Promise<void>;
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
    sortBy = 'updatedAt', // Use API default from documentation
    sortDir = 'desc',
    searchValue = ''
  } = params;

  // Get UI state from context
  const { setSelectedTaskId } = useTasksContext();
  
  // Get user info from new auth system
  const { user } = useAuth();

  // SWR data fetching
  const { tasks, isLoading, error, revalidate } = useMyTasksSummaryData({
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

  // Convert Task to TaskListItem - Memoized for performance
  const convertTaskToTaskListItem = useCallback((task: Task): TaskListItem => {
    let assignees: Array<{id: string; name: string; email: string; avatar?: string}> = [];

    // Convert assigneeProfiles to assignees
    if (task.assigneeProfiles && task.assigneeProfiles.length > 0) {
      assignees = task.assigneeProfiles.map(profile => ({
        id: profile.userId.toString(),
        name: profile.displayName || `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        avatar: profile.avatarUrl,
      }));
    }

    // Add assignedEmails as assignees if not already present
    if (task.assignedEmails && task.assignedEmails.length > 0) {
      task.assignedEmails.forEach(email => {
        const existingAssignee = assignees.find(assignee => assignee.email === email);
        if (!existingAssignee) {
          assignees.push({
            id: email,
            name: email.split('@')[0],
            email: email,
            avatar: ''
          });
        }
      });
    }

    // Use creator as fallback if no assignees
    if (assignees.length === 0 && task.creatorProfile) {
      assignees = [{
        id: task.creatorProfile.userId.toString(),
        name: task.creatorProfile.displayName || `${task.creatorProfile.firstName} ${task.creatorProfile.lastName}`.trim(),
        email: task.creatorProfile.email,
        avatar: task.creatorProfile.avatarUrl,
      }];
    }

    const taskStartDate = task.startDate ?
      (typeof task.startDate === 'object' ?
        // Use local timezone conversion to avoid UTC issues
        `${task.startDate.getFullYear()}-${String(task.startDate.getMonth() + 1).padStart(2, '0')}-${String(task.startDate.getDate()).padStart(2, '0')}` 
        : String(task.startDate)) 
      : undefined;
    
    const taskDeadline = task.deadline ? String(task.deadline) : undefined;

    return {
      id: task.id.toString(),
      name: task.title,
      description: task.description || '',
      assignees: assignees,
      // Map assignedEmails field for email assignment display
      assignedEmails: task.assignedEmails || [],
      dueDate: task.dueDate && task.dueDate !== 'No deadline' ? task.dueDate : taskDeadline,
      startDate: taskStartDate, // ✅ FIX: Properly formatted start date
      deadline: taskDeadline,   // ✅ FIX: Properly formatted deadline
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
      // Remove attachments reference since it doesn't exist on Task type
      // ✅ NEW: Google Calendar Integration Fields
      googleCalendarEventId: task.googleCalendarEventId,
      googleCalendarEventUrl: task.googleCalendarEventUrl,
      googleMeetLink: task.googleMeetLink,
      isSyncedToCalendar: task.isSyncedToCalendar,
      calendarSyncedAt: task.calendarSyncedAt,
    };
  }, []);

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
      const isProjectTask = task.project && task.project !== 'Default Project';

      if (isProjectTask) {
        const projectTaskService = await import('@/services/tasks/projectTaskService');
        const backendData = {
          title: task.name,
          description: task.description || '',
          status: (task.status === 'DONE' ? 'DONE' :
                 task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO') as 'TODO' | 'IN_PROGRESS' | 'DONE',
          priority: (task.priority === 'LOW' ? 'LOW' :
                   task.priority === 'MEDIUM' ? 'MEDIUM' :
                   task.priority === 'HIGH' ? 'HIGH' : 'CRITICAL') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          startDate: task.startDate || new Date().toISOString().split('T')[0],
          deadline: task.deadline || task.dueDate || undefined,
        };

        await projectTaskService.projectTaskService.updateTask(parseInt(task.id), backendData);
      } else {
        const tasksServiceModule = await import('@/services/tasks/tasksService');
        const backendData = {
          title: task.name,
          description: task.description || '',
          status: task.status === 'DONE' ? 'DONE' :
                 task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO',
          priority: task.priority === 'LOW' ? 'LOW' :
                   task.priority === 'MEDIUM' ? 'MEDIUM' :
                   task.priority === 'HIGH' ? 'HIGH' : 'URGENT',
          startDate: task.startDate || new Date().toISOString().split('T')[0],
          deadline: task.deadline,
          groupId: undefined,
          projectId: undefined,
          assignedToIds: task.assignees.map(a => parseInt(a.id)).filter(id => !isNaN(id)),
        };

        await tasksServiceModule.tasksService.updateTask(task.id, backendData);
      }

      revalidate();
    },

    onTaskComplete: async (task: TaskListItem) => {
      const isProjectTask = task.project && task.project !== 'Default Project';

      if (isProjectTask) {
        const projectTaskService = await import('@/services/tasks/projectTaskService');
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        await projectTaskService.projectTaskService.updateTaskStatus(parseInt(task.id), newStatus);
      } else {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        await updateTaskStatus({ id: task.id, status: newStatus });
      }

      revalidate();
    },
    
    onCreateTask: async (taskData: Record<string, unknown>) => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

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
          default:
            dueDate = todayStr;
            dueDateISO = today;
            break;
        }
      }

      const createTaskDto: CreateTaskDTO = {
        title: (taskData.name as string) || 'New Task',
        description: (taskData.description as string) || '',
        status: taskData.status === 'DONE' ? 'DONE' :
               taskData.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO',
        priority: taskData.priority === 'LOW' ? 'LOW' :
                 taskData.priority === 'MEDIUM' ? 'MEDIUM' :
                 taskData.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
        startDate: (taskData.startDate as string) || todayStr,
        deadline: (taskData.deadline as string) || dueDate,
        dueDate: (taskData.dueDate as string) || dueDate,
        dueDateISO: dueDateISO,
        groupId: (taskData.groupId as number) || undefined,
        projectId: (taskData.projectId as number) || undefined,
        creatorId: (taskData.creatorId as number) || (user ? parseInt(user.id) : 1),
        assignedToIds: (taskData.assignedToIds as number[]) || [],
      };

      await createTask(createTaskDto);
      revalidate();
    },
    
    onTaskDelete: async (taskId: string) => {
      const task = taskListItems.find(t => t.id === taskId);
      const isProjectTask = task?.project && task.project !== 'Default Project';

      if (isProjectTask) {
        const projectTaskService = await import('@/services/tasks/projectTaskService');
        await projectTaskService.projectTaskService.deleteTask(parseInt(taskId));
      } else {
        await deleteTask(taskId);
      }

      revalidate();
    },
    
    onTaskStatusChange: async (taskId: string, status: TaskStatus | string) => {
      const statusMapping: Record<string, string> = {
        'TODO': 'TODO',
        'IN_PROGRESS': 'IN_PROGRESS',
        'DONE': 'DONE',
        'completed': 'DONE',
        'todo': 'TODO'
      };

      const backendStatus = statusMapping[status.toString()] || status.toString();

      await updateTask({
        id: taskId,
        data: { status: backendStatus }
      });

      revalidate();
    },

    onTaskPriorityChange: async (taskId: string, priority: string) => {
      const priorityMapping: Record<string, string> = {
        'LOW': 'LOW',
        'MEDIUM': 'MEDIUM',
        'HIGH': 'HIGH',
        'URGENT': 'URGENT'
      };

      const backendPriority = priorityMapping[priority.toString()] || priority.toString();

      await updateTask({
        id: taskId,
        data: { priority: backendPriority }
      });

      revalidate();
    },
    
    onTaskAssign: async (taskId: string, assigneeId: string | { id: string; name: string; email: string; avatar?: string }) => {
      // Extract email from string or object input
      let cleanAssigneeId: string;

      if (typeof assigneeId === 'string') {
        cleanAssigneeId = assigneeId.trim();
      } else if (assigneeId?.email) {
        cleanAssigneeId = assigneeId.email.trim();
      } else {
        return;
      }

      if (!cleanAssigneeId || !taskId?.trim()) {
        return;
      }

      const isEmail = cleanAssigneeId.includes('@');
      const currentTask = taskListItems.find(t => t.id === taskId);

      let backendData;
      if (isEmail) {
        const existingEmails = currentTask?.assignees
          .filter(a => a.email && a.email !== '')
          .map(a => a.email!)
          .map(email => email.toLowerCase()) || [];

        const allEmails = [...new Set([...existingEmails, cleanAssigneeId.toLowerCase()])];

        backendData = {
          assignedToEmails: allEmails,
          startDate: new Date().toISOString().split('T')[0]
        };
      } else {
        const existingIds = currentTask?.assignees
          .map(a => parseInt(a.id))
          .filter(id => !isNaN(id)) || [];

        const numericId = parseInt(cleanAssigneeId);
        if (isNaN(numericId)) {
          return;
        }

        const allIds = [...new Set([...existingIds, numericId])];

        backendData = {
          assignedToIds: allIds,
          startDate: new Date().toISOString().split('T')[0]
        };
      }

      await updateTask({
        id: taskId,
        data: backendData
      });

      // Aggressive cache invalidation for immediate UI update
      const { mutate } = await import('swr');

      await mutate(
        key => typeof key === 'object' && Array.isArray(key) &&
               key.includes('tasks') && key.includes('my-tasks'),
        undefined,
        { revalidate: true }
      );

      revalidate();

      // Additional revalidation with delay to ensure backend sync
      setTimeout(() => revalidate(), 500);
    },
    
    onBulkAction: async (taskIds: string[], action: string) => {
      if (action === 'delete') {
        await Promise.all(taskIds.map(id => deleteTask(id)));
      } else if (action === 'complete') {
        await Promise.all(taskIds.map(id =>
          updateTask({ id, data: { status: 'COMPLETED' } })
        ));
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
          creatorId: user ? parseInt(user.id) : 1,
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
      
      const originalStart = task.startDate ? new Date(task.startDate) : null;
      const originalDeadline = task.deadline ? new Date(task.deadline) : null;

      if (originalStart && originalDeadline) {
        const offsetDays = Math.floor((newStartDate.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24));
        const newDeadlineDate = new Date(originalDeadline);
        newDeadlineDate.setDate(newDeadlineDate.getDate() + offsetDays);
        const newDeadlineStr = `${newDeadlineDate.getFullYear()}-${String(newDeadlineDate.getMonth() + 1).padStart(2, '0')}-${String(newDeadlineDate.getDate()).padStart(2, '0')}`;

        await updateTask({
          id: task.id.toString(),
          data: {
            startDate: newStartStr,
            deadline: newDeadlineStr
          }
        });
      } else {
        await updateTask({
          id: task.id.toString(),
          data: {
            startDate: newStartStr,
            deadline: newStartStr
          }
        });
      }

      setTimeout(() => revalidate(), 100);
    },

    onTaskResize: async (task: Task, newStartDate: Date, newEndDate: Date) => {
      const formatDate = (date: Date) => {
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
        return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      };

      await updateTask({
        id: task.id.toString(),
        data: {
          startDate: formatDate(newStartDate),
          deadline: formatDate(newEndDate),
        }
      });
    },
  }), [updateTask, updateTaskStatus, createTask, deleteTask, setSelectedTaskId, revalidate, taskListItems, user]);

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