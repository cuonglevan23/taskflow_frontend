"use client";

import React, { useMemo } from 'react';
import { TaskListItem, TaskStatus } from '@/components/TaskList/types';
import TaskDetailPanel from './TaskDetailPanel';
import { useMyTasksShared } from '@/hooks/tasks/useMyTasksShared';

interface MyTaskDetailPanelProps {
  task: TaskListItem | null;
  isOpen: boolean;
  onClose: () => void;
  myTasksActions?: any; // Actions from useMyTasksShared hook
  onRevalidate?: () => void;
}

const MyTaskDetailPanel = ({
  task,
  isOpen,
  onClose,
  myTasksActions,
  onRevalidate
}: MyTaskDetailPanelProps) => {

  // 🔥 Simple: Just use assignees from task directly
  const computedAssignees = useMemo(() => {
    if (!task || !task.assignees) return [];

    return task.assignees.map(assignee => ({
      id: assignee.id,
      name: assignee.name,
      email: assignee.email || `${assignee.name}@example.com`,
      avatar: assignee.avatar || assignee.avatarUrl
    }));
  }, [task]);

  // 🔥 Enhanced save handler for all task properties
  const handleSave = async (taskId: string, updates: Partial<TaskListItem>) => {
    try {
      if (task && myTasksActions) {
        console.log('🔄 MyTask: Updating task with:', updates);
        const updatedTask = { ...task, ...updates };
        await myTasksActions.onTaskEdit(updatedTask);
        if (onRevalidate) onRevalidate();
        console.log('✅ MyTask: Task updated successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update my task:', error);
      throw error;
    }
  };

  // 🔥 Enhanced description save handler
  const handleDescriptionSave = async (taskId: string, description: string) => {
    try {
      if (task && myTasksActions) {
        console.log('🔄 MyTask: Updating description:', description);
        const updatedTask = { ...task, description };
        await myTasksActions.onTaskEdit(updatedTask);
        if (onRevalidate) onRevalidate();
        console.log('✅ MyTask: Description updated successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update my task description:', error);
      throw error;
    }
  };

  // 🔥 Enhanced status change handler
  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      if (myTasksActions) {
        console.log('🔄 MyTask: Changing status to:', status);
        await myTasksActions.onTaskStatusChange(taskId, status as TaskStatus);
        if (onRevalidate) onRevalidate();
        console.log('✅ MyTask: Status changed successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update my task status:', error);
      throw error;
    }
  };

  // 🔥 Enhanced priority change handler
  const handlePriorityChange = async (taskId: string, priority: string) => {
    try {
      if (myTasksActions) {
        console.log('🔄 MyTask: Changing priority to:', priority);
        await myTasksActions.onTaskPriorityChange(taskId, priority);
        if (onRevalidate) onRevalidate();
        console.log('✅ MyTask: Priority changed successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update my task priority:', error);
      throw error;
    }
  };

  // 🔥 New: Due date change handler
  const handleDueDateChange = async (taskId: string, dueDate: string) => {
    try {
      if (task && myTasksActions) {
        console.log('🔄 MyTask: Changing due date to:', dueDate);
        const updatedTask = { ...task, dueDate, deadline: dueDate };
        await myTasksActions.onTaskEdit(updatedTask);
        if (onRevalidate) onRevalidate();
        console.log('✅ MyTask: Due date changed successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update my task due date:', error);
      throw error;
    }
  };

  // 🔥 New: Start date change handler
  const handleStartDateChange = async (taskId: string, startDate: string) => {
    try {
      if (task && myTasksActions) {
        console.log('🔄 MyTask: Changing start date to:', startDate);
        const updatedTask = { ...task, startDate };
        await myTasksActions.onTaskEdit(updatedTask);
        if (onRevalidate) onRevalidate();
        console.log('✅ MyTask: Start date changed successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update my task start date:', error);
      throw error;
    }
  };

  // 🔥 New: Assignee change handler
  const handleAssigneeChange = async (taskId: string, assigneeData: { id: string; name: string; email: string }) => {
    try {
      if (myTasksActions && myTasksActions.onTaskAssign) {
        console.log('🔄 MyTask: Assigning task to:', assigneeData);
        await myTasksActions.onTaskAssign(taskId, assigneeData.email);
        if (onRevalidate) onRevalidate();
        console.log('✅ MyTask: Task assigned successfully');
      }
    } catch (error) {
      console.error('❌ Failed to assign my task:', error);
      throw error;
    }
  };

  // 🔥 New: Project change handler
  const handleProjectChange = async (taskId: string, projectId: string) => {
    try {
      if (task && myTasksActions) {
        console.log('🔄 MyTask: Changing project to:', projectId);
        const updatedTask = { ...task, project: projectId };
        await myTasksActions.onTaskEdit(updatedTask);
        if (onRevalidate) onRevalidate();
        console.log('✅ MyTask: Project changed successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update my task project:', error);
      throw error;
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      if (myTasksActions && myTasksActions.onTaskDelete) {
        await myTasksActions.onTaskDelete(taskId);
        onClose(); // Close panel after deletion
        if (onRevalidate) onRevalidate();
      }
    } catch (error) {
      console.error('Failed to delete my task:', error);
      throw error;
    }
  };

  const handleFileUploadComplete = (result: any) => {
    // Handle file upload for my tasks
    console.log('My task file upload completed:', result);
    if (onRevalidate) onRevalidate();
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    // Handle attachment removal for my tasks
    console.log('Remove my task attachment:', attachmentId);
    if (onRevalidate) onRevalidate();
  };

  const handleTaskRefresh = () => {
    // Refresh my task data
    if (onRevalidate) onRevalidate();
  };

  return (
    <TaskDetailPanel
      task={task}
      isOpen={isOpen}
      onClose={onClose}
      taskType="mytask"
      computedAssignees={computedAssignees} // 🔥 Pass computed assignees
      onSave={handleSave}
      onSaveDescription={handleDescriptionSave}
      onDelete={handleDelete}
      onStatusChange={handleStatusChange}
      onPriorityChange={handlePriorityChange}
      onDueDateChange={handleDueDateChange}
      onStartDateChange={handleStartDateChange}
      onAssigneeChange={handleAssigneeChange}
      onProjectChange={handleProjectChange}
      onFileUploadComplete={handleFileUploadComplete}
      onRemoveAttachment={handleRemoveAttachment}
      onTaskRefresh={handleTaskRefresh}
    />
  );
};

export default MyTaskDetailPanel;
