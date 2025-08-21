"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { TaskListItem } from './';
import { TaskRow } from './TaskRow';
import { useTheme } from '@/layouts/hooks/useTheme';

// Project Task List Layout - Reusable component for task list content only
export interface ProjectTaskListLayoutProps {
  // Data props
  tasks?: TaskListItem[];
  projectId?: string;
  loading?: boolean;
  error?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Event handlers
  onTaskClick?: (task: TaskListItem) => void;
  onTaskCreate?: (taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    projectId?: string;
    assigneeIds?: string[];
  }) => void;
  onTaskEdit?: (task: TaskListItem) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: string) => void;
  onTaskAssign?: (taskId: string, assigneeData: {
    id: string;
    name: string;
    email: string;
  }) => void;
  onBulkAction?: (taskIds: string[], action: 'delete' | 'complete' | 'archive') => void;
}

// Main reusable layout component
export const ProjectTaskListLayout: React.FC<ProjectTaskListLayoutProps> = ({
  tasks = [],
  projectId,
  loading = false,
  error,
  searchValue = '',
  onSearchChange,
  
  // Event handlers
  onTaskClick,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskAssign,
  onBulkAction,
}) => {
  const { theme } = useTheme();
  
  // State for inline task creation (simplified like BucketTaskList)
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  // Handle task creation with proper defaults
  const handleTaskCreate = useCallback(() => {
    onTaskCreate?.({
      name: '',
      projectId: projectId,
      status: 'TODO',
      priority: 'MEDIUM'
    });
  }, [onTaskCreate, projectId]);

  // Inline task creation handlers (simplified like BucketTaskList)
  const handleStartCreating = useCallback(() => {
    setIsCreatingTask(true);
    setNewTaskName('');
  }, []);

  const handleSaveNewTask = useCallback(async () => {
    if (!newTaskName.trim()) return;
    
    try {
      await onTaskCreate?.({
        name: newTaskName.trim(),
        projectId: projectId,
        status: 'TODO',
        priority: 'MEDIUM'
      });
      
      // Reset form
      setIsCreatingTask(false);
      setNewTaskName('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }, [newTaskName, onTaskCreate, projectId]);

  const handleCancelCreating = useCallback(() => {
    setIsCreatingTask(false);
    setNewTaskName('');
  }, []);

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!searchValue) return tasks;
    
    return tasks.filter(task =>
      task.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.description.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [tasks, searchValue]);

  return (
    <>
      {/* Scrollable Task List Content */}
      <div className="flex flex-col overflow-hidden" 
           style={{
             backgroundColor: theme.background.secondary, 
             height: 'calc(100vh - var(--header-height, 80px))'
           }}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden" 
             style={{backgroundColor: theme.background.primary}}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div style={{color: theme.text.secondary}}>Loading tasks...</div>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>
                  No tasks found
                </div>
                <div style={{ color: theme.text.secondary }}>
                  Create your first task to get started
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header Row */}
              <div 
                className="sticky top-0 z-20 flex items-center py-2 px-2 text-xs font-medium border-b"
                style={{ 
                  backgroundColor: theme.background.primary,
                  borderColor: theme.border.default,
                  color: theme.text.secondary
                }}
              >
                <div className="flex-1 min-w-[300px] px-6">Name</div>
                <div className="w-[120px] px-4">Due date</div>
                <div className="w-[150px] px-4">Collaborators</div>
                <div className="w-[150px] px-4">Projects</div>
                <div className="w-[140px] px-4">Task visibility</div>
              </div>
              
              {/* Task List */}
              <div className="p-2 space-y-1">
              {/* Existing Tasks */}
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="border rounded-lg p-2"
                  style={{
                    borderColor: theme.border.default,
                    backgroundColor: theme.background.secondary
                  }}
                >
                  <TaskRow
                    task={task}
                    onTaskClick={onTaskClick}
                    onTaskEdit={onTaskEdit}
                    onTaskDelete={onTaskDelete}
                    onTaskStatusChange={onTaskStatusChange}
                    onTaskAssign={onTaskAssign}
                  />
                </div>
              ))}
              
              {/* Add New Task Row - At Bottom */}
              {isCreatingTask ? (
                <div 
                  className="flex items-center py-3 px-4 border-l-2 border-l-blue-500"
                  style={{
                    backgroundColor: `${theme.background.secondary}80`,
                    borderColor: theme.border.default
                  }}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-400 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-[300px] px-2">
                    <input
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveNewTask();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancelCreating();
                        }
                      }}
                      onBlur={handleSaveNewTask}
                      placeholder="Write a task name"
                      className="w-full bg-transparent text-sm font-medium outline-none"
                      style={{
                        color: theme.text.primary,
                        '::placeholder': { color: theme.text.secondary }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="w-[120px] px-2">
                    <span className="text-xs" style={{ color: theme.text.secondary }}>
                      Press Enter to save
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  className="group flex items-center py-3 px-4 cursor-pointer transition-all duration-200 border-l-2 border-l-transparent hover:border-l-gray-600 rounded-lg"
                  style={{
                    borderColor: theme.border.default,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.background.weakHover || `${theme.background.secondary}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={handleStartCreating}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors">+</div>
                  </div>
                  <div className="flex-1 min-w-[300px] px-2">
                    <span className="text-sm group-hover:text-gray-300 transition-colors" style={{ color: theme.text.secondary }}>
                      Add task...
                    </span>
                  </div>
                </div>
              )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

// Legacy ProjectTaskList interface for backward compatibility
export interface ProjectTaskListProps {
  // Data props - will be provided by project context/hooks
  tasks?: TaskListItem[];
  projectId?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Project-specific event handlers (no my-tasks data dependency)
  onTaskClick?: (task: TaskListItem) => void;
  onTaskCreate?: (taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    projectId?: string;
    assigneeIds?: string[];
  }) => void;
  onTaskEdit?: (task: TaskListItem) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: string) => void;
  onTaskMove?: (taskId: string, bucketId: string) => void;
  onTaskAssign?: (taskId: string, assigneeData: {
    id: string;
    name: string;
    email: string;
  }) => void;
  onBulkAction?: (taskIds: string[], action: 'delete' | 'complete' | 'archive') => void;
}

// Project-specific bucket configuration (different from my-tasks)
const PROJECT_BUCKET_CONFIGS = {
  'backlog': { 
    title: 'Backlog', 
    description: 'Ideas and future tasks',
    color: '#6B7280' 
  },
  'todo': { 
    title: 'To Do', 
    description: 'Ready to start',
    color: '#3B82F6' 
  },
  'in-progress': { 
    title: 'In Progress', 
    description: 'Currently working on',
    color: '#F59E0B' 
  },
  'review': { 
    title: 'Review', 
    description: 'Awaiting review',
    color: '#8B5CF6' 
  },
  'done': { 
    title: 'Done', 
    description: 'Completed tasks',
    color: '#10B981' 
  },
};

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({
  tasks = [],
  projectId,
  loading = false,
  error,
  className = '',
  searchValue = '',
  onSearchChange,
  
  // Project-specific handlers
  onTaskClick,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskMove,
  onTaskAssign,
  onBulkAction,
}) => {
  // Local state for Task Detail Panel
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Project-specific bucket grouping logic (different from my-tasks action time grouping)
  const getBucketInfo = useCallback((bucketId: string, taskCount: number) => {
    const config = PROJECT_BUCKET_CONFIGS[bucketId as keyof typeof PROJECT_BUCKET_CONFIGS];
    if (!config) return PROJECT_BUCKET_CONFIGS['todo'];
    
    return {
      ...config,
      description: `${config.description} (${taskCount})`
    };
  }, []);

  // Group tasks by project status (not action time like my-tasks)
  const taskBuckets = useMemo((): TaskBucket[] => {
    const bucketMap = new Map<string, TaskListItem[]>();
    
    // Initialize project buckets
    Object.keys(PROJECT_BUCKET_CONFIGS).forEach(bucket => {
      bucketMap.set(bucket, []);
    });

    // Group tasks by status (project-specific business logic)
    tasks.forEach(task => {
      let bucketId = 'todo'; // default
      
      // Map task status to project buckets
      switch (task.status?.toLowerCase()) {
        case 'backlog':
        case 'new':
          bucketId = 'backlog';
          break;
        case 'todo':
        case 'pending':
          bucketId = 'todo';
          break;
        case 'in_progress':
        case 'in-progress':
        case 'active':
          bucketId = 'in-progress';
          break;
        case 'review':
        case 'testing':
          bucketId = 'review';
          break;
        case 'done':
        case 'completed':
        case 'closed':
          bucketId = 'done';
          break;
        default:
          bucketId = 'todo';
      }
      
      const bucketTasks = bucketMap.get(bucketId) || [];
      bucketTasks.push(task);
      bucketMap.set(bucketId, bucketTasks);
    });

    // Create buckets with project-specific logic
    return Object.keys(PROJECT_BUCKET_CONFIGS).map(bucketId => {
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
  }, [tasks, getBucketInfo]);

  // Get selected task for detail panel
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find(task => task.id === selectedTaskId) || null;
  }, [selectedTaskId, tasks]);

  // Enhanced task click handler
  const handleTaskClick = useCallback((task: TaskListItem) => {
    setSelectedTaskId(task.id);
    setIsPanelOpen(true);
    onTaskClick?.(task);
  }, [onTaskClick]);

  // Enhanced task create handler with project context
  const handleTaskCreate = useCallback(async (taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    actionTime?: string;
  }) => {
    // Add project context to task creation
    const projectTaskData = {
      ...taskData,
      projectId,
      status: taskData.actionTime || taskData.status || 'todo', // Map actionTime to status for projects
      assigneeIds: [], // Empty by default for projects
    };
    
    onTaskCreate?.(projectTaskData);
  }, [onTaskCreate, projectId]);

  // Enhanced task move handler for project-specific buckets
  const handleTaskMove = useCallback(async (taskId: string, bucketId: string) => {
    // Map bucket to status for projects
    let newStatus = bucketId;
    switch (bucketId) {
      case 'backlog':
        newStatus = 'BACKLOG';
        break;
      case 'todo':
        newStatus = 'TODO';
        break;
      case 'in-progress':
        newStatus = 'IN_PROGRESS';
        break;
      case 'review':
        newStatus = 'REVIEW';
        break;
      case 'done':
        newStatus = 'DONE';
        break;
    }
    
    // Update task status when moved
    onTaskStatusChange?.(taskId, newStatus);
    onTaskMove?.(taskId, bucketId);
  }, [onTaskStatusChange, onTaskMove]);

  // Task detail panel handlers
  const handleTaskSave = useCallback(async (taskId: string, updates: Partial<TaskListItem>) => {
    onTaskEdit?.(updates as TaskListItem);
    setIsPanelOpen(false);
    setSelectedTaskId(null);
  }, [onTaskEdit]);

  const handleTaskDeleteFromPanel = useCallback((taskId: string) => {
    onTaskDelete?.(taskId);
    setIsPanelOpen(false);
    setSelectedTaskId(null);
  }, [onTaskDelete]);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedTaskId(null);
  }, []);

  return (
    <>
      {/* Inherit BucketTaskList interface but with project-specific logic */}
      <BucketTaskList
        buckets={taskBuckets}
        loading={loading}
        error={error}
        className={className}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        
        // Pass through project-specific handlers
        onTaskClick={handleTaskClick}
        onTaskCreate={handleTaskCreate}
        onTaskEdit={onTaskEdit}
        onTaskDelete={onTaskDelete}
        onTaskStatusChange={onTaskStatusChange}
        onTaskMove={handleTaskMove}
        onTaskAssign={onTaskAssign}
        onBulkAction={onBulkAction}
      />

      {/* Inherit TaskDetailPanel interface */}
      {isPanelOpen && selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onSave={handleTaskSave}
          onDelete={handleTaskDeleteFromPanel}
          onStatusChange={onTaskStatusChange}
        />
      )}
    </>
  );
};

export default ProjectTaskList;

// Export types for external use
export type { TaskBucket } from './types';
export { PROJECT_BUCKET_CONFIGS };