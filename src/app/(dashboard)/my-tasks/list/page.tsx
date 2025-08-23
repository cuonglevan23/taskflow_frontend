"use client";

import React, { useState, useCallback, useMemo } from "react";
import { BucketTaskList, TaskListItem, TaskActionTime, type TaskBucket, type TaskPriority, type TaskStatus } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useMyTasksSummary } from "@/hooks/tasks";
import { useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from "@/hooks/tasks/useTasksActions";

import { useTasksContext, type Task } from "@/contexts";
import { useTaskActionTime } from "@/hooks/tasks/useTaskActionTime";
import { useNotifications } from "@/contexts/NotificationContext";

interface MyTaskListPageProps {
  searchValue?: string;
}

const MyTaskListPage = ({ searchValue = "" }: MyTaskListPageProps) => {
  // Local state
  const [searchInput, setSearchInput] = useState(searchValue);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Get UI state from context
  const { activeFilters } = useTasksContext();
  
  // Get notification actions
  const { actions: notificationActions } = useNotifications();
  
  // Clean SWR action hooks - Next.js 15 compliant (moved before early return)
  const { createTask, isCreating } = useCreateTask();
  const { updateTask, isUpdating } = useUpdateTask();
  const { deleteTask, isDeleting } = useDeleteTask();
  const { updateTaskStatus, isUpdating: isStatusUpdating } = useUpdateTaskStatus();

  // Action time management hook
  const { moveTaskToActionTime } = useTaskActionTime();
  
  // Use modern SWR hooks for data fetching - with error handling
  const {
    tasks,
    isLoading,
    error,
    revalidate
  } = useMyTasksSummary({
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  // Don't render if there's a 401 error to prevent infinite loops
  if (error && (error.status === 401 || error.message?.includes('401'))) {
    return null;
  }

  // Helper function for notifications
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    notificationActions.addNotification({
      title: type === 'success' ? 'Success' : 'Error',
      message,
      type: type === 'success' ? 'success' : 'error',
      priority: 'medium',
      status: 'unread',
      isRead: false,
      isBookmarked: false,
      isArchived: false,
    });
  }, [notificationActions]);

  // CRUD Handlers - All API logic handled at page level for better inheritance
  const handleTaskClick = useCallback((task: TaskListItem) => {
    setSelectedTaskId(task.id);
    setIsPanelOpen(true);
  }, []);

  const handleTaskCreate = useCallback(async (taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    actionTime?: string;
  }) => {
    try {
      await createTask({
        title: taskData.name,
        description: taskData.description || '',
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        startDate: taskData.startDate || new Date().toISOString().split('T')[0],
        deadline: taskData.deadline,
      });
      showNotification('Task created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create task', 'error');
      console.error('Failed to create task:', error);
    }
  }, [createTask, showNotification]);

  const handleTaskEdit = useCallback(async (task: TaskListItem) => {
    try {
      await updateTask({
        id: task.id,
        data: {
          title: task.name,
          description: task.description,
          status: task.status,
          priority: task.priority,
          startDate: task.startDate,
          deadline: task.deadline,
        }
      });
      showNotification(`Task "${task.name}" updated successfully`, 'success');
    } catch (error) {
      showNotification('Failed to update task', 'error');
      console.error('Failed to update task:', error);
    }
  }, [updateTask, showNotification]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      showNotification('Task deleted successfully', 'success');
      // Close panel if deleting current task
      if (selectedTaskId === taskId) {
        setIsPanelOpen(false);
        setSelectedTaskId(null);
      }
    } catch (error) {
      showNotification('Failed to delete task', 'error');
      console.error('Failed to delete task:', error);
    }
  }, [deleteTask, showNotification, selectedTaskId]);

  // Clean task status change with optimistic updates
  const handleTaskStatusChange = useCallback(async (taskId: string, status: string) => {

    
    try {
      await updateTaskStatus({ id: taskId, status });
      showNotification(`Task status updated to ${status}`, 'success');

    } catch (error) {
      showNotification('Failed to update task status', 'error');
      console.error('❌ Failed to update task status:', error);
    }
  }, [updateTaskStatus, showNotification]);

  const handleTaskAssign = useCallback(async (taskId: string, assigneeData: {
    id: string;
    name: string;
    email: string;
  }) => {
    try {
      await updateTask({
        id: taskId,
        data: {
          assignedToIds: [assigneeData.id],
        }
      });
      showNotification(`Task assigned to ${assigneeData.name}`, 'success');
    } catch (error) {
      showNotification('Failed to assign task', 'error');
      console.error('Failed to assign task:', error);
    }
  }, [updateTask, showNotification]);

  const handleBulkAction = useCallback(async (taskIds: string[], action: 'delete' | 'complete' | 'archive') => {
    try {
      switch (action) {
        case 'delete':
          await Promise.all(taskIds.map(id => deleteTask(id)));
          showNotification(`${taskIds.length} tasks deleted`, 'success');
          break;
        case 'complete':
          // Use clean SWR pattern for bulk status updates
          await Promise.all(taskIds.map(id => updateTaskStatus({ id, status: 'completed' })));
          showNotification(`${taskIds.length} tasks completed`, 'success');
          break;
        case 'archive':
          // Add archive logic if needed
          showNotification(`${taskIds.length} tasks archived`, 'success');
          break;
      }
    } catch (error) {
      showNotification(`Failed to ${action} tasks`, 'error');
      console.error(`Failed to ${action} tasks:`, error);
    }
  }, [deleteTask, updateTaskStatus, showNotification]);

  // Handle task move between buckets - No manual revalidation needed
  const handleTaskMove = useCallback(async (taskId: string, bucketId: string) => {
    try {
      await moveTaskToActionTime(taskId, bucketId as TaskActionTime);
      showNotification(`Task moved to ${bucketId.replace('-', ' ')}`, 'success');
      // ✅ No manual revalidate() - optimistic updates handle this automatically
    } catch (error) {
      showNotification('Failed to move task', 'error');
      console.error('Failed to move task:', error);
    }
  }, [moveTaskToActionTime, showNotification]);

  // Convert tasks to TaskListItem format - Clean and simple
  const taskListItems = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    const mappedTasks = tasks
      .filter(task => task && task.id) // Filter out invalid tasks
      .map((task, index) => {
        const taskId = task.id?.toString() || `fallback-${index}`;
        const mappedTask = {
          id: taskId,
          name: task.title,
          description: task.description,
          assignees: task.creatorName ? [{
            id: 'creator',
            name: task.creatorName,
            avatar: task.creatorName.split(' ').map(n => n[0]).join('').toUpperCase()
          }] : [],
          dueDate: task.dueDate !== 'No due date' ? task.dueDate : undefined,
          startDate: task.startDate ? task.startDate.toISOString().split('T')[0] : undefined,
          endDate: task.endDate ? task.endDate.toISOString().split('T')[0] : undefined,
          deadline: task.dueDateISO ? task.dueDateISO.toISOString().split('T')[0] : (task.dueDate !== 'No due date' ? task.dueDate : undefined),
          priority: (task.priority?.toUpperCase() as TaskPriority) || 'MEDIUM',
          status: (task.status?.toUpperCase() as TaskStatus) || 'TODO',
          completed: task.completed || task.status === 'completed' || task.status === 'DONE',
          tags: task.tags || [],
          project: task.tagText || undefined,
          createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: task.updatedAt ? task.updatedAt.toISOString() : new Date().toISOString(),
        };
        return mappedTask;
      });

    // Remove any duplicate IDs
    const uniqueTasks = mappedTasks.filter((task, index, array) => 
      array.findIndex(t => t.id === task.id) === index
    );

    return uniqueTasks;
  }, [tasks]);

  // Business Logic: Bucket configuration for My Tasks page
  const getBucketInfo = useCallback((bucketId: string, taskCount: number) => {
    const bucketConfigs = {
      'recently-assigned': { 
        title: 'Recently assigned', 
        description: `Mới được giao (${taskCount})`,
        color: '#6B7280' 
      },
      'do-today': { 
        title: 'Do today', 
        description: `Làm hôm nay (${taskCount})`,
        color: '#DC2626' 
      },
      'do-next-week': { 
        title: 'Do next week', 
        description: `Làm tuần sau (${taskCount})`,
        color: '#F59E0B' 
      },
      'do-later': { 
        title: 'Do later', 
        description: `Để sau (${taskCount})`,
        color: '#10B981' 
      },
    };
    return bucketConfigs[bucketId as keyof typeof bucketConfigs] || bucketConfigs['do-later'];
  }, []);

  // Business Logic: Task grouping by status for My Tasks page
  const taskBuckets = useMemo((): TaskBucket[] => {
    const bucketMap = new Map<string, TaskListItem[]>();
    
    // Initialize buckets
    ['recently-assigned', 'do-today', 'do-next-week', 'do-later'].forEach(bucket => {
      bucketMap.set(bucket, []);
    });

    // Group tasks by status (business logic specific to My Tasks)
    taskListItems.forEach(task => {
      let bucketId = 'do-later'; // default
      
      if (task.status === 'TODO') {
        bucketId = 'do-today';
      } else if (task.status === 'IN_PROGRESS') {
        bucketId = 'do-today';
      } else if (task.status === 'DONE') {
        bucketId = 'do-later';
      }
      
      const bucketTasks = bucketMap.get(bucketId) || [];
      bucketTasks.push(task);
      bucketMap.set(bucketId, bucketTasks);
    });

    // Create buckets with business logic
    return [
      'recently-assigned',
      'do-today', 
      'do-next-week',
      'do-later'
    ].map(bucketId => {
      const bucketTasks = bucketMap.get(bucketId) || [];
      const bucketInfo = getBucketInfo(bucketId, bucketTasks.length);
      
      return {
        id: bucketId,
        title: bucketInfo.title,
        description: bucketInfo.description,
        color: bucketInfo.color,
        tasks: bucketTasks,
      };
    });
  }, [taskListItems, getBucketInfo]);

  // Get selected task for detail panel
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return taskListItems.find(task => task.id === selectedTaskId) || null;
  }, [selectedTaskId, taskListItems]);

  // Task detail panel handlers
  const handleTaskSave = useCallback(async (taskId: string, updates: Partial<TaskListItem>) => {
    try {
      await updateTask({
        id: taskId,
        data: {
          title: updates.name,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          startDate: updates.startDate,
          deadline: updates.deadline,
        }
      });
      showNotification('Task saved successfully', 'success');
      setIsPanelOpen(false);
      setSelectedTaskId(null);
    } catch (error) {
      showNotification('Failed to save task', 'error');
      console.error('Failed to save task:', error);
    }
  }, [updateTask, showNotification]);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedTaskId(null);
  }, []);

  // Enhanced search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Apply search filter to tasks
  const filteredTasks = useMemo(() => {
    if (!taskListItems || !Array.isArray(taskListItems)) return [];
    if (!searchInput.trim()) return taskListItems;
    
    const searchLower = searchInput.toLowerCase();
    return taskListItems.filter(task => 
      task.name?.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower)
    );
  }, [taskListItems, searchInput]);

  // Task management object - Clean and simple
  const taskManagement = useMemo(() => ({
    tasks: taskListItems,
    buckets: taskBuckets,
    filteredTasks,
    isLoading,
    isUpdating: isUpdating || isCreating || isDeleting || isStatusUpdating,
    isDeleting,
    error: error?.message || null,
    selectedTask,
    isPanelOpen,
    closeTaskPanel: handleClosePanel,
    stats: {
      total: taskListItems.length,
      completed: taskListItems.filter(t => t.completed || t.status === 'DONE').length,
      inProgress: taskListItems.filter(t => t.status === 'IN_PROGRESS').length,
      todo: taskListItems.filter(t => t.status === 'TODO').length,
    }
  }), [
    taskListItems,
    taskBuckets,
    filteredTasks,
    isLoading,
    isUpdating,
    isCreating,
    isDeleting,
    isStatusUpdating,
    error,
    selectedTask,
    isPanelOpen,
    handleClosePanel
  ]);

  // Enhanced task actions object - Pass specific handlers instead of generic actions
  const taskActions = useMemo(() => ({
    onTaskClick: handleTaskClick,
    onTaskEdit: handleTaskEdit,
    onCreateTask: handleTaskCreate,
    onTaskDelete: handleTaskDelete,
    onTaskStatusChange: handleTaskStatusChange,
    onTaskAssign: handleTaskAssign,
    onBulkAction: handleBulkAction,
  }), [
    handleTaskClick,
    handleTaskEdit,
    handleTaskCreate,
    handleTaskDelete,
    handleTaskStatusChange,
    handleTaskAssign,
    handleBulkAction,
  ]);

  // Loading state with better UX
  if (taskManagement.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-gray-600 text-lg">Loading your tasks...</div>
        <div className="text-gray-400 text-sm mt-2">Please wait a moment</div>
      </div>
    );
  }

  // Error state with retry option
  if (taskManagement.error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-red-600 text-lg font-medium mb-2">
          Failed to load tasks
        </div>
        <div className="text-gray-500 text-sm mb-4">
          {taskManagement.error}
        </div>
        <button
          onClick={() => revalidate()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Main Task List - Clean separation of concerns */}
        <BucketTaskList
          buckets={taskManagement.buckets}
          loading={taskManagement.isLoading}
          error={taskManagement.error ?? undefined}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          onTaskClick={handleTaskClick}
          onTaskCreate={handleTaskCreate}
          onTaskEdit={handleTaskEdit}
          onTaskDelete={handleTaskDelete}
          onTaskStatusChange={handleTaskStatusChange}

          onTaskAssign={handleTaskAssign}
          onBulkAction={handleBulkAction}
        />
      </div>

      {/* Enhanced Task Detail Panel */}
      {taskManagement.isPanelOpen && taskManagement.selectedTask && (
        <TaskDetailPanel
          task={taskManagement.selectedTask}
          isOpen={taskManagement.isPanelOpen}
          onClose={taskManagement.closeTaskPanel}
          onSave={handleTaskSave}
          onDelete={(taskId: string) => handleTaskDelete(taskId)}
          onStatusChange={handleTaskStatusChange}
        />
      )}
    </>
  );
};

export default MyTaskListPage;
