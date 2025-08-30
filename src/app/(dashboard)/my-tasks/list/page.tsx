"use client";

import React, { useState, useCallback, useMemo } from "react";
import { BucketTaskList } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useMyTasksShared } from "@/hooks/tasks/useMyTasksShared";
import { TaskListItem, TaskStatus } from "@/components/TaskList/types";

interface TaskBucket {
  id: string;
  title: string;
  description: string;
  color: string;
  tasks: TaskListItem[];
  collapsed?: boolean;
}

interface MyTaskListPageProps {
  searchValue?: string;
}

const MyTaskListPage = ({ searchValue = "" }: MyTaskListPageProps) => {
  // Local state
  const [searchInput, setSearchInput] = useState(searchValue);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Use shared hook - same as board/calendar pages
  const {
    taskListItems,
    isLoading,
    error,
    actions
  } = useMyTasksShared({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc',
    searchValue: searchInput
  });

  // Action time buckets logic (same as board page)
  const taskBuckets = useMemo((): TaskBucket[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Filter tasks based on search
    const filteredTasks = searchInput.trim() 
      ? taskListItems.filter(task => 
          task.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchInput.toLowerCase())
        )
      : taskListItems;

    // Filter tasks based on assignment date and due date
    const recentlyAssigned = filteredTasks.filter(task => {
      const createdAt = new Date(task.createdAt);
      const daysDiff = (today.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7; // Tasks created in last 7 days
    });

    const doToday = filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    const doNextWeek = filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today && dueDate <= nextWeek;
    });

    const doLater = filteredTasks.filter(task => {
      if (!task.dueDate) return true; // Tasks without due date go to "Do later"
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > nextWeek;
    });

    return [
      {
        id: "recently-assigned",
        title: "Recently assigned",
        description: `Tasks created in the last 7 days (${recentlyAssigned.length})`,
        color: "#8b5cf6",
        tasks: recentlyAssigned,
      },
      {
        id: "do-today",
        title: "Do today",
        description: `Tasks due today (${doToday.length})`,
        color: "#ef4444",
        tasks: doToday,
      },
      {
        id: "do-next-week",
        title: "Do next week",
        description: `Tasks due within next week (${doNextWeek.length})`,
        color: "#f59e0b", 
        tasks: doNextWeek,
      },
      {
        id: "do-later",
        title: "Do later",
        description: `Tasks due later or without due date (${doLater.length})`,
        color: "#10b981",
        tasks: doLater,
      },
    ];
  }, [taskListItems, searchInput]);

  // Notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // Could be replaced with actual toast notification system
    console.log(`${type === 'success' ? '✅' : '❌'} ${message}`);
  }, []);

  // Panel handlers
  const handleTaskClick = useCallback((task: TaskListItem) => {
    setSelectedTaskId(task.id);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedTaskId(null);
  }, []);

  const handleTaskSave = useCallback(async (taskId: string, updates: Partial<TaskListItem>) => {
    try {
      const task = taskListItems.find(t => t.id === taskId);
      if (task) {
        await actions.onTaskEdit({ ...task, ...updates });
        showNotification('Task updated successfully');
        handleClosePanel();
      }
    } catch (error) {
      showNotification('Failed to update task', 'error');
      console.error('Task save error:', error);
    }
  }, [taskListItems, actions, showNotification, handleClosePanel]);

  // Dedicated description save handler that doesn't close panel
  const handleDescriptionSave = useCallback(async (taskId: string, description: string) => {
    try {
      const task = taskListItems.find(t => t.id === taskId);
      if (task) {
        await actions.onTaskEdit({ ...task, description });
        showNotification('Description updated successfully');
        // DON'T close panel for description saves
      }
    } catch (error) {
      showNotification('Failed to update description', 'error');
      console.error('Description save error:', error);
    }
  }, [taskListItems, actions, showNotification]);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: string) => {
    try {
      await actions.onTaskStatusChange(taskId, status as TaskStatus);
      showNotification('Task status updated successfully');
    } catch (error) {
      showNotification('Failed to update task status', 'error');
      console.error('Task status change error:', error);
    }
  }, [actions, showNotification]);

  const handleTaskPriorityChange = useCallback(async (taskId: string, priority: string) => {
    try {
      await actions.onTaskPriorityChange(taskId, priority);
      showNotification('Task priority updated successfully');
    } catch (error) {
      showNotification('Failed to update task priority', 'error');
      console.error('Task priority change error:', error);
    }
  }, [actions, showNotification]);

  const handleTaskAssign = useCallback(async (taskId: string, assigneeData: { id: string; name: string; email: string }) => {
    try {
      await actions.onTaskAssign(taskId, assigneeData.email);
      showNotification('Task assigned successfully');
    } catch (error) {
      showNotification('Failed to assign task', 'error');
      console.error('Task assign error:', error);
    }
  }, [actions, showNotification]);

  // 🚀 NEW: Task Creation Handler - Connect to useMyTasksShared action
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
      console.log('🔥 handleTaskCreate called with:', taskData);

      // Call the action from useMyTasksShared which will:
      // 1. Create task via tasksService.createTask
      // 2. Automatically call revalidate() to refresh the UI
      await actions.onCreateTask(taskData);

      showNotification('Task created successfully');
      console.log('✅ Task created and UI should refresh automatically');
    } catch (error) {
      showNotification('Failed to create task', 'error');
      console.error('❌ Task creation error:', error);
    }
  }, [actions, showNotification]);

  const toggleFavorite = () => {
    alert('Add to favorites functionality will be implemented');
  };

  // Get selected task
  const selectedTask = useMemo(() => {
    return taskListItems.find(task => task.id === selectedTaskId) || null;
  }, [taskListItems, selectedTaskId]);

  // Loading and error states
  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error loading tasks: {error.message}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <BucketTaskList
        buckets={taskBuckets}
        loading={isLoading}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onTaskClick={handleTaskClick}
        onTaskCreate={actions.onCreateTask}
        onTaskEdit={actions.onTaskEdit}
        onTaskDelete={actions.onTaskDelete}
        onTaskStatusChange={handleTaskStatusChange}
        onTaskAssign={handleTaskAssign}
      />

      {/* Task Detail Panel */}
      {isPanelOpen && selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onSave={handleTaskSave}
          onSaveDescription={handleDescriptionSave}
          onStatusChange={handleTaskStatusChange}
          onPriorityChange={handleTaskPriorityChange}
        />
      )}
    </div>
  );
};

export default MyTaskListPage;
