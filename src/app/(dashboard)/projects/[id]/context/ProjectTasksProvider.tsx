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
  updateTask: (taskId: number, updates: UpdateProjectTaskRequest) => Promise<ProjectTaskResponseDto>;
  deleteTask: (taskId: number) => Promise<void>;
  updateTaskStatus: (taskId: number, status: string) => Promise<void>;
  assignTask: (taskId: number, userId: number) => Promise<void>;
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
    pagination 
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
      return await createTask(taskData);
    },
    
    updateTask: async (taskId: number, updates: UpdateProjectTaskRequest) => {
      return await updateTaskMutation({ taskId, updates });
    },
    
    deleteTask: async (taskId: number) => {
      await deleteTaskMutation(taskId);
    },
    
    updateTaskStatus: async (taskId: number, status: string) => {
      await updateTaskMutation({ taskId, updates: { status: status as any } });
    },
    
    assignTask: async (taskId: number, userId: number) => {
      await updateTaskMutation({ taskId, updates: { assigneeId: userId } });
    },
  };

  return (
    <ProjectTasksContext.Provider value={contextValue}>
      {children}
    </ProjectTasksContext.Provider>
  );
};