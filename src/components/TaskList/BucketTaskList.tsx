"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { TaskListItem } from './types';
import { TaskRow } from './TaskRow';
import { SortableTaskRow } from './TaskRow/SortableTaskRow';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

export interface TaskBucket {
  id: string;
  title: string;
  description: string;
  color: string;
  textColor?: string; // Add textColor property
  tasks: TaskListItem[];
  collapsed?: boolean;
}

export interface BucketTaskListProps {
  buckets: TaskBucket[];
  loading?: boolean;
  error?: string;
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Event handlers - let parent decide how to handle these
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
  onTaskPriorityChange?: (taskId: string, priority: string) => void; // 🔥 Add missing prop
  onTaskMove?: (taskId: string, bucketId: string) => void;
  onTaskAssign?: (taskId: string, assigneeData: {
    id: string;
    name: string;
    email: string;
  }) => void;
  onBulkAction?: (taskIds: string[], action: 'delete' | 'complete' | 'archive') => void;
}

const BucketTaskList: React.FC<BucketTaskListProps> = ({
  buckets,
  loading = false,
  error,
  className = '',
  searchValue = '',
  onSearchChange,
  
  // Event handlers
  onTaskClick,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskPriorityChange, // 🔥 Add missing prop destructuring
  onTaskMove,
  onTaskAssign,
  onBulkAction,
}) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const [activeTask, setActiveTask] = useState<TaskListItem | null>(null);
  const [collapsedBuckets, setCollapsedBuckets] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

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
    console.log('➕ BucketTaskList.handleAddTask called for bucket:', bucketId);
    setEditingSection(bucketId);
    setNewTaskName('');
  };

  const handleSaveTask = () => {
    console.log('🔧 BucketTaskList.handleSaveTask called with newTaskName:', newTaskName);
    if (!newTaskName.trim()) {
      console.log('⚠️ Task name is empty, skipping save');
      return;
    }
    
    const taskData = {
      name: newTaskName.trim(),
      status: 'TODO' as const,
      actionTime: editingSection || undefined,
    };
    
    console.log('📤 BucketTaskList calling onTaskCreate with:', taskData);
    onTaskCreate?.(taskData);
    setEditingSection(null);
    setNewTaskName('');
  };

  const handleCancelTask = () => {
    setEditingSection(null);
    setNewTaskName('');
  };

  // Simplified task click handler - just call parent's onTaskClick
  const handleTaskClick = useCallback((task: TaskListItem) => {
    onTaskClick?.(task);
  }, [onTaskClick]);

  // Loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center h-64 ${className}`}
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="flex items-center gap-3">
          <div
            className="animate-spin rounded-full h-6 w-6 border-b-2"
            style={{ borderColor: theme.text.muted }}
          ></div>
          <span style={{ color: theme.text.secondary }}>
            {t('cards.myTasks.loading')}
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center h-64 ${className}`}
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            {t('notifications.somethingWentWrong') || 'Something went wrong'}
          </h3>
          <p style={{ color: theme.text.secondary }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full ${className}`}
      style={{
        // Create table-like border collapse effect
        border: `1px solid ${theme.border.default}`,
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* Column Headers - Exactly like the image */}
      <div 
        className="sticky top-0 z-20 flex items-center py-2 px-2 text-xs font-medium border-b"
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
          color: theme.text.muted,
          borderBottom: `1px solid ${theme.border.default}`,
          margin: 0
        }}
      >
        <div className="flex-1 min-w-[300px] px-6" style={{ borderRight: `1px solid ${theme.border.default}` }}>
          {t('taskList.headers.name') || 'Name'}
        </div>
        <div className="w-[120px] px-4" style={{ borderRight: `1px solid ${theme.border.default}` }}>
          {t('taskList.headers.dueDate') || 'Due date'}
        </div>
        <div className="w-[100px] px-2 text-center" style={{ borderRight: `1px solid ${theme.border.default}` }}>
          {t('taskList.headers.priority') || 'Priority'}
        </div>
        <div className="w-[120px] px-2 text-center" style={{ borderRight: `1px solid ${theme.border.default}` }}>
          {t('taskList.headers.status') || 'Status'}
        </div>
        <div className="w-[150px] px-4" style={{ borderRight: `1px solid ${theme.border.default}` }}>
          {t('taskList.headers.collaborators') || 'Collaborators'}
        </div>
        <div className="w-[60px] px-2 flex justify-center">
          {t('taskList.headers.comments') || 'Comments'}
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          // Remove gaps between rows like border-collapse
          display: 'block'
        }}>
          {taskBuckets.map((bucket) => (
            <div key={bucket.id}>
              {/* Section Header */}
              <div
                id={`bucket-${bucket.id}`}
                className="group flex items-center py-2 px-4 cursor-pointer transition-colors"
                style={{
                  backgroundColor: `${theme.background.primary} !important`,
                  borderBottom: `1px solid ${theme.border.default} !important`,
                  color: `${theme.text.primary} !important`,
                  position: 'relative',
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.setProperty('background-color', theme.background.weakHover, 'important');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty('background-color', theme.background.primary, 'important');
                }}
                onClick={() => toggleCollapse(bucket.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {bucket.collapsed ? (
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: `${bucket.textColor || theme.text.muted} !important` }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-4 h-4"
                      style={{ color: `${bucket.textColor || theme.text.muted} !important` }}
                    />
                  )}
                  {/* Color indicator dot */}
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span
                    className={`text-sm font-medium`}
                    style={{
                      color: bucket.textColor || theme.text.primary,
                      fontWeight: '500',
                    }}
                    ref={(el) => {
                      // Force color application via direct DOM manipulation
                      if (el) {
                        const color = bucket.textColor || theme.text.primary;
                        el.style.setProperty('color', color, 'important');
                        el.style.setProperty('-webkit-text-fill-color', color, 'important');
                      }
                    }}
                  >
                    {bucket.title}
                  </span>
                  {bucket.tasks.length > 0 && (
                    <span
                      className="text-xs ml-1 px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: theme.background.tertiary,
                      }}
                      ref={(el) => {
                        // Force color application via direct DOM manipulation
                        if (el) {
                          const color = bucket.textColor || theme.text.secondary;
                          el.style.setProperty('color', color, 'important');
                          el.style.setProperty('-webkit-text-fill-color', color, 'important');
                        }
                      }}
                    >
                      {bucket.tasks.length}
                    </span>
                  )}
                </div>

                {/* Add Task Button */}
                <button
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:scale-105 transition-transform opacity-0 group-hover:opacity-100"
                  style={{
                    border: `1px solid ${theme.border.muted}`,
                    backgroundColor: 'transparent',
                  }}
                  ref={(el) => {
                    // Apply theme-aware colors via direct DOM manipulation
                    if (el) {
                      el.style.setProperty('color', theme.text.muted, 'important');
                      el.style.setProperty('-webkit-text-fill-color', theme.text.muted, 'important');
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTask(bucket.id);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.setProperty('background-color', theme.background.secondary, 'important');
                    e.currentTarget.style.setProperty('color', theme.text.primary, 'important');
                    e.currentTarget.style.setProperty('-webkit-text-fill-color', theme.text.primary, 'important');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty('background-color', 'transparent', 'important');
                    e.currentTarget.style.setProperty('color', theme.text.muted, 'important');
                    e.currentTarget.style.setProperty('-webkit-text-fill-color', theme.text.muted, 'important');
                  }}
                >
                  <Plus
                    className="w-3 h-3"
                    style={{ color: 'inherit' }}
                  />
                  {t('taskList.addTask') || 'Add task'}
                </button>
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
                              onTaskPriorityChange={onTaskPriorityChange}
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
                <div
                  className="flex items-center py-3 px-4 border-l-2 transition-colors"
                  style={{
                    borderLeftColor: theme.status.info,
                    backgroundColor: theme.background.secondary + '80'
                  }}
                >
                  <div className="flex-shrink-0 mr-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-pulse"
                      style={{ borderColor: theme.status.info }}
                    />
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
                      placeholder={t('taskList.addTaskPlaceholder') || 'Write a task name'}
                      className="w-full bg-transparent text-sm font-medium outline-none"
                      style={{
                        color: theme.text.primary,
                        '::placeholder': { color: theme.text.muted }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="w-[120px] px-2">
                    <span
                      className="text-xs"
                      style={{ color: theme.text.muted }}
                    >
                      {t('taskList.pressEnterToSave') || 'Press Enter to save'}
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  className="group flex items-center py-3 px-4 cursor-pointer transition-all duration-200 border-l-2 border-l-transparent"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.background.weakHover;
                    e.currentTarget.style.borderLeftColor = theme.border.muted;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                  onClick={() => handleAddTask(bucket.id)}
                >
                  <div className="flex-shrink-0 mr-3">
                    <Plus
                      className="w-4 h-4 transition-colors"
                      style={{ color: theme.text.muted }}
                    />
                  </div>
                  <div className="flex-1 min-w-[300px] px-2">
                    <span
                      className="text-sm transition-colors"
                      style={{ color: theme.text.muted }}
                    >
                      {t('taskList.addTask') || 'Add task...'}
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
            e.currentTarget.style.backgroundColor = theme.background.weakHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => {/* Handle add section */}}
        >
          <div className="flex-shrink-0 mr-3">
            <Plus
              className="w-4 h-4"
              style={{ color: theme.text.muted }}
            />
          </div>
          <span
            className="text-sm"
            style={{ color: theme.text.muted }}
          >
            {t('taskList.addSection') || 'Add section'}
          </span>
        </div>

        {/* Drag Overlay - Enhanced */}
        <DragOverlay>
          {activeTask ? (
            <div
              className="rounded-lg shadow-2xl opacity-90 transform rotate-2"
              style={{
                backgroundColor: theme.background.secondary,
                border: `1px solid ${theme.border.default}`
              }}
            >
              <TaskRow task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BucketTaskList;
