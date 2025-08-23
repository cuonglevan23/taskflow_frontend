"use client";

import React, { useState, useMemo } from 'react';
import { TaskListItem } from './types';
import { DARK_THEME } from '@/constants/theme';
import { DndContext, DragOverlay, closestCenter, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { SortableTaskRow, TaskRow } from './TaskRow/';

interface BucketTaskListProps {
  buckets: TaskBucket[];
  loading?: boolean;
  error?: string;
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Individual handler props for clean separation and reusability
  onTaskClick?: (task: TaskListItem) => void;
  onTaskCreate?: (taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    actionTime?: string;
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

export interface TaskBucket {
  id: string;
  title: string;
  description: string;
  color: string;
  tasks: TaskListItem[];
  collapsed?: boolean;
}



const BucketTaskList = ({
  buckets,
  loading = false,
  error,
  className = '',
  searchValue = '',
  onSearchChange,
  
  // Individual handlers for clean separation
  onTaskClick,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskMove,
  onTaskAssign,
  onBulkAction,
}: BucketTaskListProps) => {
  const [activeTask, setActiveTask] = useState<TaskListItem | null>(null);
  const [collapsedBuckets, setCollapsedBuckets] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  
  // Task Detail Panel state
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Pure presentation component - buckets come from props with collapsed state
  const taskBuckets = useMemo((): TaskBucket[] => {
    return buckets.map(bucket => ({
      ...bucket,
      collapsed: collapsedBuckets.has(bucket.id),
    }));
  }, [buckets, collapsedBuckets]);

  // Get all tasks for drag and drop operations
  const allTasks = useMemo(() => {
    return buckets.flatMap(bucket => bucket.tasks);
  }, [buckets]);

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = allTasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Check if dropped on a bucket
    const bucketId = overId.startsWith('bucket-') ? overId.replace('bucket-', '') : null;
    if (bucketId) {
      onTaskMove?.(activeId, bucketId);
    }
  };

  const toggleCollapse = (bucketId: string) => {
    const newCollapsed = new Set(collapsedBuckets);
    if (newCollapsed.has(bucketId)) {
      newCollapsed.delete(bucketId);
    } else {
      newCollapsed.add(bucketId);
    }
    setCollapsedBuckets(newCollapsed);
  };

  const handleAddTask = (bucketId: string) => {
    setEditingSection(bucketId);
    setNewTaskName('');
  };

  const handleSaveTask = () => {
    if (!newTaskName.trim()) return;
    
    const taskData = {
      name: newTaskName.trim(),
      status: 'TODO' as const,
      actionTime: editingSection || undefined,
    };
    
    onTaskCreate?.(taskData);
    setEditingSection(null);
    setNewTaskName('');
  };

  const handleCancelTask = () => {
    setEditingSection(null);
    setNewTaskName('');
  };

  // Task Detail Panel handlers
  const handleTaskClick = (task: TaskListItem) => {
    onTaskClick?.(task);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedTask(null);
  };

  const handleTaskSave = (taskId: string, updates: Partial<TaskListItem>) => {
    // Call the provided edit handler
    console.log('Save task updates:', taskId, updates);
    if (updates.id) {
      onTaskEdit?.(updates as TaskListItem);
    }
    handleClosePanel();
  };

  const handleTaskDeleteFromPanel = (taskId: string) => {
    // Call the provided delete handler
    console.log('Delete task:', taskId);
    onTaskDelete?.(taskId);
    handleClosePanel();
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center h-64 ${className}`}
        style={{ backgroundColor: DARK_THEME.background.primary }}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          <span className="text-gray-300">Loading tasks...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center h-64 ${className}`}
        style={{ backgroundColor: DARK_THEME.background.primary }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2 text-white">
            Something went wrong
          </h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full ${className}`}
    >
      {/* Column Headers - Exactly like the image */}
      <div 
        className="sticky top-0 z-20 flex items-center py-2 px-2 text-xs font-medium border-b"
        style={{ 
          backgroundColor: DARK_THEME.background.primary,
          borderColor: DARK_THEME.border.default,
          color: '#9CA3AF'
        }}
      >
        <div className="flex-1 min-w-[300px] px-6">Name</div>
        <div className="w-[120px] px-4">Due date</div>
        <div className="w-[150px] px-4">Collaborators</div>
        <div className="w-[150px] px-4">Projects</div>
        <div className="w-[140px] px-4">Task visibility</div>

      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div>
          {taskBuckets.map((bucket) => (
            <div key={bucket.id}>
              {/* Section Header */}
              <div
                id={`bucket-${bucket.id}`}
                className="flex items-center py-2 px-4 cursor-pointer transition-colors"

                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => toggleCollapse(bucket.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {bucket.collapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-white">
                    {bucket.title}
                  </span>
                  {bucket.tasks.length > 0 && (
                    <span className="text-xs text-gray-400 ml-1">
                      ({bucket.tasks.length})
                    </span>
                  )}


                </div>
              </div>

              {/* Tasks */}
              {!bucket.collapsed && (
                <div>
                  {(() => {
                    try {
                      const validTasks = Array.isArray(bucket.tasks) 
                        ? bucket.tasks.filter(task => task && typeof task === 'object' && task.id && typeof task.id === 'string')
                        : [];
                      
                      const taskIds = validTasks.map(t => t.id);
                      
                      return (
                        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                          {validTasks.map((task, index) => (
                            <SortableTaskRow
                              key={`${bucket.id}-${task.id}-${index}`}
                              task={task}
                              onTaskClick={handleTaskClick}
                              onMoveTask={onTaskMove}
                              onTaskEdit={onTaskEdit}
                              onTaskDelete={onTaskDelete}
                              onTaskStatusChange={onTaskStatusChange}
                              onTaskAssign={onTaskAssign}
                            />
                          ))}
                        </SortableContext>
                      );
                    } catch (error) {
                      console.error('Error rendering tasks for bucket:', bucket.id, error);
                      return (
                        <div className="p-4 text-red-500 text-sm">
                          Error loading tasks for this section. Please try refreshing the page.
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Add Task Input - Enhanced */}
              {editingSection === bucket.id ? (
                <div className="flex items-center py-3 px-4 border-l-2 border-l-blue-500 bg-gray-800/50">
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
                          handleSaveTask();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancelTask();
                        }
                      }}
                      onBlur={handleSaveTask}
                      placeholder="Write a task name"
                      className="w-full bg-transparent text-white text-sm font-medium outline-none placeholder-gray-400"
                      autoFocus
                    />
                  </div>
                  <div className="w-[120px] px-2">
                    <span className="text-xs text-gray-500">Press Enter to save</span>
                  </div>
                </div>
              ) : (
                <div 
                  className="group flex items-center py-3 px-4 cursor-pointer transition-all duration-200 border-l-2 border-l-transparent hover:border-l-gray-600"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => handleAddTask(bucket.id)}
                >
                  <div className="flex-shrink-0 mr-3">
                    <Plus className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-[300px] px-2">
                    <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                      Add task...
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Section Button */}
        <div 
          className="flex items-center py-2 px-4 cursor-pointer transition-colors"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => {/* Handle add section */}}
        >
          <div className="flex-shrink-0 mr-3">
            <Plus className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm text-gray-400">Add section</span>
        </div>

        {/* Drag Overlay - Enhanced */}
        <DragOverlay>
          {activeTask ? (
            <div className="bg-gray-700 border border-gray-600 rounded-lg shadow-2xl opacity-90 transform rotate-2">
              <TaskRow task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Panel */}
      {isPanelOpen && selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onSave={handleTaskSave}
          onDelete={handleTaskDeleteFromPanel}
        />
      )}
    </div>
  );
};

export default BucketTaskList;