"use client";

import React, { createContext, useContext } from 'react';
import { useProjectTasksByProject, useCreateProjectTask, useUpdateProjectTask, useDeleteProjectTask } from '@/hooks/tasks/useProjectTasks';
import { useProject } from '../components/DynamicProjectProvider';
import type { ProjectTaskResponseDto, CreateProjectTaskRequest, UpdateProjectTaskRequest } from '@/services/tasks/projectTaskService';

interface ProjectTasksContextValue {
  // Data
  tasks: ProjectTaskResponseDto[];
  loading: boolean;
  error: string | null;
  pagination: any;

  // Actions
  createTask: (taskData: CreateProjectTaskRequest) => Promise<ProjectTaskResponseDto>;
  updateTask: (taskId: number, updates: {
      title: string;
      description: string;
      status: "TODO" | "IN_PROGRESS" | "DONE" | "TESTING" | "BLOCKED" | "REVIEW";
      priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      startDate: string | undefined;
      deadline: string | undefined;
      progressPercentage: any
  }) => Promise<ProjectTaskResponseDto>;
  deleteTask: (taskId: number) => Promise<void>;
  updateTaskStatus: (taskId: number, status: string) => Promise<void>;
  assignTask: (taskId: number, userId: number) => Promise<void>;
  // ADDED: Refresh function to reload tasks data
  refreshTasks: () => void;
}

const ProjectTasksContext = createContext<ProjectTasksContextValue | null>(null);

export const useProjectTasksContext = () => {
  const context = useContext(ProjectTasksContext);
  if (!context) {
    throw new Error('useProjectTasksContext must be used within ProjectTasksProvider');
  }
  return context;
};

export const ProjectTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { project } = useProject();
  const projectId = project?.id;

  // Single source of truth for project tasks
  const {
    tasks,
    loading,
    error,
    pagination,
    revalidate: refreshTasks
  } = useProjectTasksByProject(projectId || 0, 0, 100);

  // Shared mutations
  const { trigger: createTask } = useCreateProjectTask();
  const { trigger: updateTaskMutation } = useUpdateProjectTask();
  const { trigger: deleteTaskMutation } = useDeleteProjectTask();

  // Wrapper functions to match expected signatures
  const contextValue: ProjectTasksContextValue = {
    tasks,
    loading,
    error,
    pagination,

    createTask: async (taskData: CreateProjectTaskRequest) => {
      const result = await createTask(taskData);
      // Auto-refresh after creating task
      refreshTasks();
      return result;
    },

    updateTask: async (taskId: number, updates: UpdateProjectTaskRequest) => {
      const result = await updateTaskMutation({ taskId, updates });
      // Auto-refresh after updating task
      refreshTasks();
      return result;
    },

    deleteTask: async (taskId: number) => {
      await deleteTaskMutation(taskId);
      // Auto-refresh after deleting task
      refreshTasks();
    },

    updateTaskStatus: async (taskId: number, status: string) => {
      await updateTaskMutation({ taskId, updates: { status: status as any } });
      // Auto-refresh after updating status
      refreshTasks();
    },

    assignTask: async (taskId: number, userId: number) => {
      await updateTaskMutation({ taskId, updates: { assigneeId: userId } });
      // Auto-refresh after assigning task
      refreshTasks();
    },

    // ADDED: Expose refresh function for manual refresh
    refreshTasks,
  };

  return (
    <ProjectTasksContext.Provider value={contextValue}>
      {children}
    </ProjectTasksContext.Provider>
  );
};
