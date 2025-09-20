"use client";

import React, { useState, useCallback, useMemo } from "react";
import { BucketTaskList } from "@/components/TaskList";
import { MyTaskDetailPanel } from "@/components/TaskDetailPanel"; // 🔥 Changed import
import { useMyTasksShared } from "@/hooks/tasks/useMyTasksShared";
import { TaskListItem, TaskStatus } from "@/components/TaskList/types";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useThemeContext } from "@/providers/ThemeProvider";


interface TaskBucket {
  id: string;
  title: string;
  description: string;
  color: string;
  textColor?: string; // Add optional textColor property
  tasks: TaskListItem[];
  collapsed?: boolean;
}

interface MyTaskListPageProps {
  searchValue?: string;
}

const MyTaskListPage = ({ searchValue = "" }: MyTaskListPageProps) => {
  const [searchInput, setSearchInput] = useState(searchValue);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { messages } = useLanguageContext();
  const { theme } = useThemeContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const {
    taskListItems,
    isLoading,
    error,
    actions,
    revalidate
  } = useMyTasksShared({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc',
    searchValue: searchInput
  });

  const taskBuckets = useMemo((): TaskBucket[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const filteredTasks = searchInput.trim()
        ? taskListItems.filter(task =>
            task.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchInput.toLowerCase())
        )
        : taskListItems;

    const recentlyAssigned = filteredTasks.filter(task => {
      const createdAt = new Date(task.createdAt);
      const daysDiff = Math.abs((today.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 30;
    });

    const doToday = filteredTasks.filter(task => {
      if (!task.dueDate && !task.deadline) return false;
      const dueDate = new Date(task.dueDate || task.deadline || '');
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    const doNextWeek = filteredTasks.filter(task => {
      if (!task.dueDate && !task.deadline) return false;
      const dueDate = new Date(task.dueDate || task.deadline || '');
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today && dueDate <= nextWeek;
    });

    const doLater = filteredTasks.filter(task => {
      if (!task.dueDate && !task.deadline) return false;
      const dueDate = new Date(task.dueDate || task.deadline || '');
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > nextWeek;
    });

    const tasksWithoutDates = filteredTasks.filter(task =>
        !task.dueDate && !task.deadline
    );

    const allRecentlyAssigned = [...recentlyAssigned, ...tasksWithoutDates];

    const uniqueRecentlyAssigned = allRecentlyAssigned.filter(task => {
      const isInOtherBuckets = doToday.some(t => t.id === task.id) ||
          doNextWeek.some(t => t.id === task.id) ||
          doLater.some(t => t.id === task.id);
      return !isInOtherBuckets;
    });

    return [
      {
        id: "recently-assigned",
        title: t('taskSections.recentlyAssigned.title'),
        description: `${t('taskSections.recentlyAssigned.description')} (${uniqueRecentlyAssigned.length})`,
        color: theme?.status?.info || "#8b5cf6",
        textColor: theme?.text?.primary || "#f8fafc", // Use primary text color for better visibility
        tasks: uniqueRecentlyAssigned,
      },
      {
        id: "do-today",
        title: t('taskSections.doToday.title'),
        description: `${t('taskSections.doToday.description')} (${doToday.length})`,
        color: theme?.status?.error || "#ef4444",
        textColor: theme?.text?.primary || "#f8fafc", // Use primary text color for better visibility
        tasks: doToday,
      },
      {
        id: "do-next-week",
        title: t('taskSections.doNextWeek.title'),
        description: `${t('taskSections.doNextWeek.description')} (${doNextWeek.length})`,
        color: theme?.status?.warning || "#f59e0b",
        textColor: theme?.text?.primary || "#f8fafc", // Use primary text color for better visibility
        tasks: doNextWeek,
      },
      {
        id: "do-later",
        title: t('taskSections.doLater.title'),
        description: `${t('taskSections.doLater.description')} (${doLater.length})`,
        color: theme?.status?.success || "#10b981",
        textColor: theme?.text?.primary || "#f8fafc", // Use primary text color for better visibility
        tasks: doLater,
      },
    ];
  }, [taskListItems, searchInput, t, theme]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // Replace with actual toast notification system if available
  }, []);

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
        const updatedTask = { ...task, ...updates };
        await actions.onTaskEdit(updatedTask);
        await revalidate(); // Force revalidation after update
        showNotification('Task updated successfully');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      showNotification('Failed to update task', 'error');
    }
  }, [taskListItems, actions, showNotification, revalidate]);

  const handleTaskEdit = useCallback(async (updatedTask: TaskListItem) => {
    try {
      await actions.onTaskEdit(updatedTask);
      await revalidate(); // Force revalidation after update
      showNotification('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      showNotification('Failed to update task', 'error');
    }
  }, [actions, showNotification, revalidate]);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: TaskStatus) => {
    try {
      await actions.onTaskStatusChange(taskId, status);
      await revalidate(); // Force revalidation after status change
      showNotification('Task status updated');
    } catch (error) {
      console.error('Failed to update task status:', error);
      showNotification('Failed to update task status', 'error');
    }
  }, [actions, showNotification, revalidate]);

  const handleTaskPriorityChange = useCallback(async (taskId: string, priority: string) => {
    try {
      await actions.onTaskPriorityChange(taskId, priority);
      await revalidate(); // Force revalidation after priority change
      showNotification('Task priority updated');
    } catch (error) {
      console.error('Failed to update task priority:', error);
      showNotification('Failed to update task priority', 'error');
    }
  }, [actions, showNotification, revalidate]);

  const handleTaskAssign = useCallback(async (taskId: string, assigneeData: { id: string; name: string; email: string }) => {
    try {
      await actions.onTaskAssign(taskId, assigneeData.email);
      await revalidate();
      showNotification('Task assigned successfully');
    } catch (error) {
      showNotification('Failed to assign task', 'error');
    }
  }, [actions, showNotification, revalidate]);

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
      await actions.onCreateTask(taskData);
      showNotification('Task created successfully');
    } catch (error) {
      showNotification('Failed to create task', 'error');
    }
  }, [actions, showNotification]);

  if (error) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Failed to load tasks: {error.message}</div>
        </div>
    );
  }

  return (
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 overflow-auto">
          <BucketTaskList
              buckets={taskBuckets}
              onTaskClick={handleTaskClick}
              onTaskEdit={handleTaskEdit}
              onTaskStatusChange={(taskId: string, status: string) => handleTaskStatusChange(taskId, status as TaskStatus)}
              onTaskPriorityChange={handleTaskPriorityChange}
              onTaskAssign={handleTaskAssign}
              onTaskCreate={handleTaskCreate}
              loading={isLoading}
          />
        </div>

        {/* 🔥 Use MyTaskDetailPanel instead of TaskDetailPanel */}
        <MyTaskDetailPanel
            task={selectedTaskId ? taskListItems.find(t => t.id === selectedTaskId) || null : null}
            isOpen={isPanelOpen}
            onClose={handleClosePanel}
            myTasksActions={actions} // 🔥 Pass actions from useMyTasksShared
            onRevalidate={revalidate} // 🔥 Pass revalidate function
        />
      </div>
  );
};

export default MyTaskListPage;
