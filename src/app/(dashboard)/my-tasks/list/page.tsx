"use client";

import React, { useMemo, useState } from "react";
import { TaskList, TaskListItem, TaskStatus } from "@/components/TaskList";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useTasksContext, type Task } from "@/contexts";
import { useTasks, useUpdateTask, useDeleteTask, useCreateTask, useMyTasksSummary } from "@/hooks/useTasks";
import { CookieAuth } from '@/utils/cookieAuth';

interface MyTaskListPageProps {
  searchValue?: string;
}



const MyTaskListPage: React.FC<MyTaskListPageProps> = ({ searchValue = "" }) => {
  // Get UI state from context
  const { activeFilters } = useTasksContext();
  
  // Use global SWR hooks for data
  const { tasks, isLoading, error } = useMyTasksSummary({
    page: 0,
    size: 1000,
    sortBy: 'startDate',
    sortDir: 'desc'
  });
  
  // SWR mutation hooks
  const { updateTask } = useUpdateTask();
  const { deleteTask } = useDeleteTask();
  const { createTask } = useCreateTask();
  
  // Transform tasks to TaskListItem format
  const taskListItems = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks.map(task => ({
      id: task.id.toString(),
      name: task.title,
      description: task.description || '',
      assignees: task.creatorName ? [{
        id: 'creator',
        name: task.creatorName,
        email: '',
      }] : [],
      dueDate: task.dueDate || 'No deadline',
      startDate: task.dueDate && task.dueDate !== 'No deadline' ? task.dueDate : undefined,
      endDate: task.dueDate && task.dueDate !== 'No deadline' ? task.dueDate : undefined,
      startTime: '',
      endTime: '',
      hasStartTime: false,
      hasEndTime: false,
      priority: (task.priority as any) || 'medium',
      status: task.status === 'completed' ? 'done' : 
              task.status === 'in-progress' ? 'in_progress' : 'todo',
      tags: task.tags || [],
      project: task.tagText || 'Default Project',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));
  }, [tasks]);

  // Task management object
  const taskManagement = useMemo(() => ({
    tasks: taskListItems,
    isLoading,
    error: error?.message || null,
  }), [taskListItems, isLoading, error]);



  // Create simple task actions
  const taskActions = {
    onTaskClick: (task: any) => console.log('Task clicked:', task),
    onCreateTask: async (taskData: any) => {
      await createTask(taskData);
    },
    onUpdateTask: async (taskId: string, updates: any) => {
      await updateTask({ id: taskId, data: updates });
    },
    onDeleteTask: async (taskId: string) => {
      await deleteTask(taskId);
    },
    onBulkAction: async (taskIds: string[], action: string) => {
      console.log('Bulk action:', action, taskIds);
    }
  };

  // Handle loading and error states
  if (taskManagement.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (taskManagement.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Error loading tasks: {taskManagement.error}
        </div>
      </div>
    );
  }

  // Task detail panel logic - Using unified management
  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    taskManagement.updateTask(taskId, updates);
  };

  const handleTaskDelete = (taskId: string) => {
    taskManagement.deleteTask(taskId);
  };

  // Note: searchValue prop not needed as TaskList manages its own search state

  return (
    <>
      <div className="h-full overflow-y-auto">
        <TaskList
          tasks={taskManagement.tasks}
          config={{
            showSearch: true,
            showFilters: true,
            showSort: true,
            enableGrouping: true,
            defaultGroupBy: 'assignmentDate',
            showSelection: true,
            columns: [
              { key: 'name', label: 'Name', width: 'flex-1 min-w-[300px]', sortable: true },
              { key: 'dueDate', label: 'Due date', width: 'w-[120px]', sortable: true },
              { key: 'assignees', label: 'Collaborators', width: 'w-[150px]', sortable: false },
              { key: 'project', label: 'Projects', width: 'w-[150px]', sortable: true },
              { key: 'status', label: 'Task visibility', width: 'w-[140px]', sortable: true },
              { key: 'actions', label: '+', width: 'w-[50px]', sortable: false },
            ],
          }}
          actions={taskActions}
          loading={taskManagement.isLoading}
          error={taskManagement.error ?? undefined}
          hideHeader={true}
        />
      </div>

      {/* Task Detail Panel - Synchronized with Global Context */}
      <TaskDetailPanel
        task={taskManagement.selectedTask}
        isOpen={taskManagement.isPanelOpen}
        onClose={taskManagement.closeTaskPanel}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
      />
    </>
  );
};

export default MyTaskListPage;
