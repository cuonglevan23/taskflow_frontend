/**
 * Custom hook for centralized project task creation logic
 * Provides a clean, reusable interface for creating tasks across different components
 *
 * @author TaskFlow Team
 * @version 1.0.0
 */

import { useCallback } from 'react';
import { useProjectTasksContext } from '@/app/(dashboard)/projects/[id]/context/ProjectTasksProvider';
import type { CreateProjectTaskRequest } from '@/services/tasks/projectTaskService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Task status enum with all possible values
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

/**
 * Task priority enum with all possible values
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Flexible input interface for task creation from various UI components
 */
export interface TaskCreationInput {
  /** Task title/name (required) */
  name: string;
  /** Task description (optional) */
  description?: string;
  /** Task status - will be normalized to API enum */
  status?: string;
  /** Task priority - will be normalized to API enum */
  priority?: string;
  /** Start date in YYYY-MM-DD format */
  startDate?: string;
  /** Deadline in YYYY-MM-DD format */
  deadline?: string;
  /** Project ID (can be overridden, defaults to hook's projectId) */
  projectId?: string | number;
  /** Array of assignee IDs */
  assigneeIds?: string[];
  /** Estimated hours for task completion */
  estimatedHours?: number;
  /** Current actual hours spent (defaults to 0) */
  actualHours?: number;
  /** Progress percentage 0-100 (defaults to 0) */
  progressPercentage?: number;
  /** Parent task ID for subtasks */
  parentTaskId?: string | number;
}

/**
 * Return type for the hook
 */
export interface UseProjectTaskCreationReturn {
  /** Function to create a new task */
  createTask: (taskData: TaskCreationInput) => Promise<any>;
  /** Whether the project is ready for task creation */
  isProjectReady: boolean;
  /** Current project ID */
  projectId: number | null;
}

// =============================================================================
// NORMALIZATION UTILITIES
// =============================================================================

/**
 * Normalizes status string to valid TaskStatus enum
 */
const normalizeStatus = (status?: string): TaskStatus => {
  if (!status) return TaskStatus.TODO;

  const normalized = status.toUpperCase().replace(/[-_\s]/g, '_');

  const statusMap: Record<string, TaskStatus> = {
    TODO: TaskStatus.TODO,
    PENDING: TaskStatus.TODO,
    BACKLOG: TaskStatus.TODO,
    NEW: TaskStatus.TODO,

    IN_PROGRESS: TaskStatus.IN_PROGRESS,
    INPROGRESS: TaskStatus.IN_PROGRESS,
    ACTIVE: TaskStatus.IN_PROGRESS,
    STARTED: TaskStatus.IN_PROGRESS,
    WORKING: TaskStatus.IN_PROGRESS,

    DONE: TaskStatus.DONE,
    COMPLETED: TaskStatus.DONE,
    FINISHED: TaskStatus.DONE,
    CLOSED: TaskStatus.DONE,
  };

  return statusMap[normalized] || TaskStatus.TODO;
};

/**
 * Normalizes priority string to valid TaskPriority enum
 */
const normalizePriority = (priority?: string): TaskPriority => {
  if (!priority) return TaskPriority.MEDIUM;

  const normalized = priority.toUpperCase();

  const priorityMap: Record<string, TaskPriority> = {
    LOW: TaskPriority.LOW,
    MINOR: TaskPriority.LOW,
    TRIVIAL: TaskPriority.LOW,

    MEDIUM: TaskPriority.MEDIUM,
    NORMAL: TaskPriority.MEDIUM,
    MODERATE: TaskPriority.MEDIUM,
    STANDARD: TaskPriority.MEDIUM,

    HIGH: TaskPriority.HIGH,
    IMPORTANT: TaskPriority.HIGH,
    MAJOR: TaskPriority.HIGH,

    CRITICAL: TaskPriority.CRITICAL,
    URGENT: TaskPriority.CRITICAL,
    BLOCKER: TaskPriority.CRITICAL,
    EMERGENCY: TaskPriority.CRITICAL,
  };

  return priorityMap[normalized] || TaskPriority.MEDIUM;
};

/**
 * Safely converts string/number to number or undefined
 */
const safeToNumber = (value?: string | number): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  return isNaN(num) ? undefined : num;
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates the normalized task request
 */
const validateTaskRequest = (request: CreateProjectTaskRequest): void => {
  const errors: string[] = [];

  // Required field validation
  if (!request.title?.trim()) {
    errors.push('Task title is required and cannot be empty');
  }

  if (!request.projectId || request.projectId <= 0) {
    errors.push('Valid project ID is required');
  }

  // Numeric field validation
  if (request.estimatedHours !== undefined && request.estimatedHours < 0) {
    errors.push('Estimated hours cannot be negative');
  }

  if (request.actualHours !== undefined && request.actualHours < 0) {
    errors.push('Actual hours cannot be negative');
  }

  if (request.progressPercentage !== undefined &&
      (request.progressPercentage < 0 || request.progressPercentage > 100)) {
    errors.push('Progress percentage must be between 0 and 100');
  }

  // Date validation
  if (request.startDate && request.deadline) {
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.deadline);

    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format. Use YYYY-MM-DD');
    }

    if (isNaN(endDate.getTime())) {
      errors.push('Invalid deadline format. Use YYYY-MM-DD');
    }

    if (startDate.getTime() && endDate.getTime() && endDate < startDate) {
      errors.push('Deadline cannot be before start date');
    }
  }

  // ID validation
  if (request.assigneeId !== undefined && request.assigneeId <= 0) {
    errors.push('Invalid assignee ID');
  }

  if (request.additionalAssigneeIds?.some(id => id <= 0)) {
    errors.push('Invalid additional assignee ID(s)');
  }

  if (request.parentTaskId !== undefined && request.parentTaskId !== null && request.parentTaskId <= 0) {
    errors.push('Invalid parent task ID');
  }

  if (errors.length > 0) {
    throw new Error(`Task validation failed: ${errors.join(', ')}`);
  }
};

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Custom hook for centralized project task creation
 *
 * @param projectId - The project ID for task creation
 * @returns Object with createTask function and project status
 *
 * @example
 * ```typescript
 * const { createTask, isProjectReady } = useProjectTaskCreation(projectId);
 *
 * const handleCreateTask = async () => {
 *   try {
 *     await createTask({
 *       name: "New Task",
 *       description: "Task description",
 *       priority: "high",
 *       assigneeIds: ["1", "2"]
 *     });
 *   } catch (error) {
 *     console.error("Failed to create task:", error);
 *   }
 * };
 * ```
 */
export const useProjectTaskCreation = (projectId: number | null): UseProjectTaskCreationReturn => {
  const { createTask: createTaskAPI } = useProjectTasksContext();

  const createTask = useCallback(async (taskData: TaskCreationInput) => {
    try {
      // Validate project readiness
      const targetProjectId = safeToNumber(taskData.projectId) || projectId;

      if (!targetProjectId) {
        throw new Error('Project ID is required for task creation');
      }

      // Build normalized request
      const createTaskRequest: CreateProjectTaskRequest = {
        // Required fields
        title: taskData.name.trim(),
        projectId: targetProjectId,

        // Optional fields with normalization
        description: taskData.description?.trim() || '',
        status: normalizeStatus(taskData.status),
        priority: normalizePriority(taskData.priority),

        // Date fields (pass through if valid)
        startDate: taskData.startDate || undefined,
        deadline: taskData.deadline || undefined,

        // Numeric fields with safe conversion and defaults
        estimatedHours: safeToNumber(taskData.estimatedHours) ?? 0,
        actualHours: safeToNumber(taskData.actualHours) ?? 0,
        progressPercentage: safeToNumber(taskData.progressPercentage) ?? 0,

        // Assignment fields with safe conversion
        assigneeId: taskData.assigneeIds?.[0] ? safeToNumber(taskData.assigneeIds[0]) : undefined,
        additionalAssigneeIds: taskData.assigneeIds?.slice(1)
          .map(id => safeToNumber(id))
          .filter((id): id is number => id !== undefined) || [],

        // Hierarchy field
        parentTaskId: safeToNumber(taskData.parentTaskId) ?? null,
      };

      // Validate request before sending
      validateTaskRequest(createTaskRequest);

      console.log('🚀 Creating task with normalized data:', createTaskRequest);


      // Execute API call
      const result = await createTaskAPI(createTaskRequest);

      console.log('✅ Task created successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Task creation failed:', error);
      throw error;
    }
  }, [createTaskAPI, projectId]);

  return {
    createTask,
    isProjectReady: !!projectId,
    projectId,
  };
};

export default useProjectTaskCreation;
