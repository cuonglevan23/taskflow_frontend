"use client";

import React, { useState } from 'react';
import { useMyTasksSummary } from '@/hooks/tasks/useTasksData';
import { useTaskActionTime } from '@/hooks/tasks/useTaskActionTime';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/tasks/useTasksActions';
import BucketTaskList from '@/components/TaskList/BucketTaskList';
import { TaskListItem, TaskListActions, TaskActionTime } from '@/components/TaskList/types';
import { useTheme } from '@/layouts/hooks/useTheme';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function TaskBucketViewPage() {
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = useState('');

  // Data hooks
  const { data: tasksData, isLoading, error } = useMyTasksSummary();
  const { moveTaskToActionTime } = useTaskActionTime();
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTask();
  const { deleteTask } = useDeleteTask();

  // Convert backend tasks to TaskListItem format
  const tasks: TaskListItem[] = React.useMemo(() => {
    if (!tasksData?.tasks) return [];
    
    return tasksData.tasks.map(task => ({
      id: task.id.toString(),
      name: task.title,
      description: task.description,
      assignees: task.assigneeId ? [{
        id: task.assigneeId.toString(),
        name: `User ${task.assigneeId}`,
        email: '',
      }] : [],
      dueDate: task.dueDate,
      startDate: task.startDate?.toISOString().split('T')[0],
      endDate: task.endDate?.toISOString().split('T')[0],
      priority: task.priority?.toUpperCase() as any || 'MEDIUM',
      status: task.status?.toUpperCase() as any || 'TODO',
      project: task.projectId?.toString(),
      actionTime: (task as any).actionTime || 'recently-assigned', // Default to recently-assigned
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));
  }, [tasksData]);

  // Task actions
  const taskActions: TaskListActions = {
    onTaskClick: (task) => {
      console.log('Task clicked:', task);
      // Could open task detail modal here
    },

    onTaskEdit: async (updatedTask) => {
      try {
        await updateTask({
          id: updatedTask.id,
          data: {
            title: updatedTask.name,
            description: updatedTask.description,
            dueDate: updatedTask.dueDate,
            priority: updatedTask.priority.toLowerCase() as any,
            status: updatedTask.status.toLowerCase() as any,
            actionTime: updatedTask.actionTime,
          }
        });
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    },

    onTaskDelete: async (taskId) => {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    },

    onTaskStatusChange: async (taskId, status) => {
      try {
        await updateTask({
          id: taskId,
          data: { status: status.toLowerCase() as any }
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    },

    onTaskActionTimeChange: async (taskId, actionTime) => {
      try {
        await moveTaskToActionTime(taskId, actionTime);
      } catch (error) {
        console.error('Failed to move task to action time:', error);
      }
    },

    onCreateTask: async (taskData) => {
      try {
        if (typeof taskData === 'string') {
          // Simple string task name
          await createTask({
            title: taskData,
            description: '',
            priority: 'medium',
            actionTime: 'recently-assigned',
          });
        } else if (taskData) {
          // Full task object
          await createTask({
            title: taskData.title || (taskData as any).name || 'New Task',
            description: taskData.description || '',
            priority: taskData.priority?.toLowerCase() as any || 'medium',
            dueDate: (taskData as any).dueDate,
            actionTime: (taskData as any).actionTime || 'recently-assigned',
          });
        }
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    },

    onBulkAction: async (taskIds, action) => {
      console.log('Bulk action:', action, 'on tasks:', taskIds);
      // Implement bulk actions as needed
    },
  };

  const handleTaskMove = async (taskId: string, bucketId: string) => {
    try {
      await moveTaskToActionTime(taskId, bucketId as TaskActionTime);
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.background.primary }}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: theme.border.default }}
      >
        <div className="flex items-center gap-4">
          <Link 
            href="/tasks"
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: theme.background.secondary }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: theme.text.secondary }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
              My Tasks - Bucket View
            </h1>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              Organize tasks by personal action time without affecting deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: theme.background.secondary,
              color: theme.text.primary,
            }}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Bucket Task List */}
      <div className="flex-1 overflow-hidden">
        <BucketTaskList
          tasks={tasks}
          actions={taskActions}
          onTaskMove={handleTaskMove}
          loading={isLoading}
          error={error}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
      </div>

      {/* Footer Info */}
      <div 
        className="p-4 border-t text-center"
        style={{ 
          borderColor: theme.border.default,
          backgroundColor: theme.background.secondary,
        }}
      >
        <p className="text-sm" style={{ color: theme.text.secondary }}>
          💡 <strong>Tip:</strong> Kéo thả tasks giữa các bucket để tổ chức theo thời gian cá nhân. 
          Deadline gốc không thay đổi - chỉ thay đổi cách bạn ưu tiên công việc.
        </p>
      </div>
    </div>
  );
}