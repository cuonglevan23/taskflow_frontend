"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { ProjectTaskListLayout } from '@/components/TaskList/ProjectTaskList';
import { TaskListItem } from '@/components/TaskList';
import { useProject } from '../components/DynamicProjectProvider';
import { 
  useProjectTasksByProject, 
  useProjectTaskActions 
} from '@/hooks/tasks/useProjectTasks';
import type { 
  ProjectTaskResponseDto,
  CreateProjectTaskRequest 
} from '@/services/tasks/projectTaskService';

interface ProjectListPageProps {
  searchValue?: string;
}

function ProjectTaskListContent({ searchValue = "" }: ProjectListPageProps) {
  const { project } = useProject();
  const projectId = project?.id ? Number(project.id) : null;
  
  // Use API hooks instead of context
  const { 
    tasks: projectTasks, 
    loading, 
    error
  } = useProjectTasksByProject(projectId || 0, 0, 100);
  
  const {
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    loading: actionLoading
  } = useProjectTaskActions();

  // Local state for search
  const [searchInput, setSearchInput] = useState(searchValue);

  // Convert project tasks to TaskListItem format
  const taskListItems = useMemo((): TaskListItem[] => {
    if (!projectTasks || !Array.isArray(projectTasks)) return [];

    return projectTasks.map((task: ProjectTaskResponseDto) => ({
      id: task.id.toString(),
      name: task.title,
      description: task.description || '',
      assignees: [
        ...(task.assigneeName ? [{
          id: task.assigneeId?.toString() || '',
          name: task.assigneeName,
          email: task.assigneeEmail || '',
        }] : []),
        ...(task.additionalAssignees || []).map(assignee => ({
          id: assignee.id.toString(),
          name: assignee.name,
          email: assignee.email,
        }))
      ],
      dueDate: task.deadline,
      deadline: task.deadline,
      startDate: task.startDate,
      endDate: task.deadline,
      priority: task.priority as any || 'MEDIUM',
      status: task.status as any || 'TODO',
      tags: [], // API doesn't have tags yet
      project: task.projectName || project?.name || '',
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completed: task.status === 'DONE',
      progressPercentage: task.progressPercentage || 0,
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
    }));
  }, [projectTasks, project?.name]);

  // Project-specific task handlers (no my-tasks data dependency)
  const handleTaskClick = useCallback((task: TaskListItem) => {
    console.log('Project task clicked:', task);
  }, []);

  const handleTaskCreate = useCallback(async (taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    projectId?: string;
    assigneeIds?: string[];
  }) => {
    try {
      if (!projectId) {
        console.error('No project ID available');
        return;
      }

      const createTaskRequest: CreateProjectTaskRequest = {
        title: taskData.name,
        description: taskData.description || '',
        projectId: projectId,
        status: taskData.status as any || 'TODO',
        priority: taskData.priority as any || 'MEDIUM',
        startDate: taskData.startDate,
        deadline: taskData.deadline,
        assigneeId: taskData.assigneeIds?.[0] ? Number(taskData.assigneeIds[0]) : undefined,
        additionalAssigneeIds: taskData.assigneeIds?.slice(1).map(id => Number(id)) || [],
        progressPercentage: 0,
      };

      await createTask(createTaskRequest);

    } catch (error) {
      console.error('❌ Failed to create project task:', error);
      throw error;
    }
  }, [createTask, projectId]);

  const handleTaskEdit = useCallback(async (task: TaskListItem) => {
    try {
      const updateRequest = {
        title: task.name,
        description: task.description,
        status: task.status as any,
        priority: task.priority as any,
        startDate: task.startDate,
        deadline: task.deadline,
        progressPercentage: task.progressPercentage || 0,
      };

      await updateTask(Number(task.id), updateRequest);

    } catch (error) {
      console.error('❌ Failed to update project task:', error);
      throw error;
    }
  }, [updateTask]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await deleteTask(Number(taskId));

    } catch (error) {
      console.error('❌ Failed to delete project task:', error);
      throw error;
    }
  }, [deleteTask]);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: string) => {
    try {
      await updateTaskStatus({ taskId: Number(taskId), status });

    } catch (error) {
      console.error('❌ Failed to change project task status:', error);
      throw error;
    }
  }, [updateTaskStatus]);

  const handleTaskMove = useCallback(async (taskId: string, bucketId: string) => {
    console.log('Project task moved:', { taskId, bucketId });
    // Task move is handled by status change - map bucketId to status
    const statusMapping: { [key: string]: string } = {
      'backlog': 'TODO',
      'todo': 'TODO', 
      'in-progress': 'IN_PROGRESS',
      'review': 'REVIEW',
      'done': 'DONE',
      'blocked': 'BLOCKED',
      'testing': 'TESTING'
    };
    
    const newStatus = statusMapping[bucketId] || bucketId;
    await handleTaskStatusChange(taskId, newStatus);
  }, [handleTaskStatusChange]);

  const handleTaskAssign = useCallback(async (taskId: string, assigneeData: {
    id: string;
    name: string;
    email: string;
  }) => {
    try {
      await assignTask(Number(taskId), Number(assigneeData.id));
      console.log('✅ Project task assigned successfully:', { taskId, assigneeData });
    } catch (error) {
      console.error('❌ Failed to assign project task:', error);
      throw error;
    }
  }, [assignTask]);

  const handleBulkAction = useCallback(async (taskIds: string[], action: 'delete' | 'complete' | 'archive') => {
    try {
      console.log('Project bulk action:', { taskIds, action });
      // Implement bulk actions based on project requirements
    } catch (error) {
      console.error('Failed to perform project bulk action:', error);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Show development notice for API issues (non-blocking)
  const showDevelopmentNotice = taskListItems.length === 0 && !loading && !error;

  if (error && !error.includes('404')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            {error}
          </div>
          <p className="text-gray-600">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>

      
      <ProjectTaskListLayout
        tasks={taskListItems}
        projectId={projectId?.toString()}
        loading={loading}
        error={error && !error.includes('404') ? error : undefined}
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        
        // Event handlers
        onTaskClick={handleTaskClick}
        onTaskCreate={handleTaskCreate}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onTaskStatusChange={handleTaskStatusChange}
        onTaskAssign={handleTaskAssign}
        onBulkAction={handleBulkAction}
      />
    </>
  );
}

export default function ProjectListPage({ searchValue }: ProjectListPageProps) {
  return <ProjectTaskListContent searchValue={searchValue} />;
}