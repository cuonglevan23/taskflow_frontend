"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { ProjectTaskListLayout } from '@/components/TaskList/ProjectTaskList';
import { TaskListItem } from '@/components/TaskList';
import { useProject } from '../components/DynamicProjectProvider';
import { useProjectTasksContext } from '../context/ProjectTasksProvider';
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
  
  // Use shared context instead of individual hooks
  const { 
    tasks: projectTasks, 
    loading, 
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    loading: actionLoading
  } = useProjectTasksContext();

  // Local state for search
  const [searchInput, setSearchInput] = useState(searchValue);

  // Convert project tasks to TaskListItem format
  const taskListItems = useMemo((): TaskListItem[] => {
    if (!projectTasks || !Array.isArray(projectTasks)) return [];

    return projectTasks.map((task: ProjectTaskResponseDto) => {
      const taskListItem = {
        id: task.id.toString(), // Ensure this is string
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
      };
      
      // Debug log to verify task conversion
      console.log('🔍 Converting project task:', {
        originalId: task.id,
        originalIdType: typeof task.id,
        convertedId: taskListItem.id,
        convertedIdType: typeof taskListItem.id
      });
      
      return taskListItem;
    });
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
      console.log('🔍 Task edit debug:', {
        taskId: task.id,
        taskIdType: typeof task.id,
        taskData: task
      });
      
      // Ensure taskId is valid
      const taskId = Number(task.id);
      if (isNaN(taskId)) {
        throw new Error(`Invalid task ID: ${task.id}`);
      }
      
      // Ensure proper data types and validation with mapping
      const mapStatus = (status: string): 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW' => {
        switch (status.toLowerCase()) {
          case 'completed':
          case 'done':
            return 'DONE';
          case 'in_progress':
          case 'in-progress':
          case 'inprogress':
            return 'IN_PROGRESS';
          case 'testing':
            return 'TESTING';
          case 'blocked':
            return 'BLOCKED';
          case 'review':
            return 'REVIEW';
          case 'todo':
          default:
            return 'TODO';
        }
      };

      const mapPriority = (priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
        switch (priority.toUpperCase()) {
          case 'HIGH':
            return 'HIGH';
          case 'LOW':
            return 'LOW';
          case 'CRITICAL':
          case 'URGENT':
            return 'CRITICAL';
          case 'MEDIUM':
          default:
            return 'MEDIUM';
        }
      };
      
      const updateRequest = {
        title: task.name,
        description: task.description || '',
        status: mapStatus(task.status),
        priority: mapPriority(task.priority),
        startDate: task.startDate || undefined,
        deadline: task.deadline || undefined,
        progressPercentage: 0, // Default value
      };

      console.log('🔄 Updating project task:', taskId, 'with data:', updateRequest);
      await updateTask(taskId, updateRequest);
      console.log('✅ Project task updated successfully');

    } catch (error) {
      console.error('❌ Failed to update project task:', error);
      throw error;
    }
  }, [updateTask]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      console.log('🔍 Delete debug:', { taskId, taskIdType: typeof taskId });
      
      const numericTaskId = Number(taskId);
      if (isNaN(numericTaskId)) {
        throw new Error(`Invalid task ID for delete: ${taskId}`);
      }
      
      await deleteTask(numericTaskId);

    } catch (error) {
      console.error('❌ Failed to delete project task:', error);
      throw error;
    }
  }, [deleteTask]);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: string) => {
    try {
      console.log('🔍 Status change debug:', { taskId, taskIdType: typeof taskId, status });
      
      const numericTaskId = Number(taskId);
      if (isNaN(numericTaskId)) {
        throw new Error(`Invalid task ID for status change: ${taskId}`);
      }
      
      // Map frontend status to backend status
      const mapStatus = (status: string): 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW' => {
        switch (status.toLowerCase()) {
          case 'completed':
          case 'done':
            return 'DONE';
          case 'in_progress':
          case 'in-progress':
          case 'inprogress':
            return 'IN_PROGRESS';
          case 'testing':
            return 'TESTING';
          case 'blocked':
            return 'BLOCKED';
          case 'review':
            return 'REVIEW';
          case 'todo':
          default:
            return 'TODO';
        }
      };
      
      const backendStatus = mapStatus(status);
      console.log('🔄 Mapped status:', { original: status, mapped: backendStatus });
      
      await updateTaskStatus(numericTaskId, backendStatus);

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