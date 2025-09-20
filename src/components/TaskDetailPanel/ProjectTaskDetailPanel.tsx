"use client";

import React from 'react';
import { TaskListItem } from '@/components/TaskList/types';
import TaskDetailPanel from './TaskDetailPanel';
import {
  useProjectTaskAssignees,
  useProjectTaskComments,
  useProjectTaskActivities,
  useProjectTaskOperations
} from '@/hooks/project-task-detail';

interface ProjectTaskDetailPanelProps {
  task: TaskListItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectTaskDetailPanel = ({
  task,
  isOpen,
  onClose
}: ProjectTaskDetailPanelProps) => {
  // Use separated hooks for clean architecture
  const {
    computedAssignees,
  } = useProjectTaskAssignees({
    task,
    projectId: task?.projectId || null
  });

  const {
    projectComments,
    commentsLoading,
    newComment,
    commentSubmitting,
    editingCommentId,
    editingCommentContent,
    setNewComment,
    setEditingCommentContent,
    handleCreateComment,
    handleDeleteComment,
    handleEditComment,
    handleEditCommentSubmit,
    handleEditCommentCancel,
  } = useProjectTaskComments({ task, isOpen });

  const {
    projectActivities,
    activitiesLoading,
  } = useProjectTaskActivities({ task, isOpen });

  const {
    latestTask,
    handleTaskUpdate,
    handleTaskStatusUpdate,
    handleTaskDelete,
    handleTaskRefresh,
    handleFileUploadComplete,
    handleRemoveAttachment,
  } = useProjectTaskOperations({ task });

  // Create wrapper handlers for TaskDetailPanel compatibility
  const handleSave = async (taskId: string, updates: Partial<TaskListItem>) => {
    try {
      // Convert TaskListItem updates to the format expected by the API
      const updateRequest: any = {};

      if (updates.name) updateRequest.title = updates.name;
      if (updates.description) updateRequest.description = updates.description;
      if (updates.status) updateRequest.status = updates.status;
      if (updates.priority) updateRequest.priority = updates.priority;
      if (updates.deadline) updateRequest.deadline = updates.deadline;
      if (updates.startDate) updateRequest.startDate = updates.startDate;

      await handleTaskUpdate(updateRequest);
    } catch (error) {
      console.error('Failed to save task:', error);
      throw error;
    }
  };

  const handleDescriptionSave = async (taskId: string, description: string) => {
    try {
      await handleTaskUpdate({ description });
    } catch (error) {
      console.error('Failed to save description:', error);
      throw error;
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await handleTaskStatusUpdate(status);
    } catch (error) {
      console.error('Failed to change status:', error);
      throw error;
    }
  };

  const handlePriorityChange = async (taskId: string, priority: string) => {
    try {
      const validPriority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      await handleTaskUpdate({ priority: validPriority });
    } catch (error) {
      console.error('Failed to change priority:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await handleTaskDelete();
      onClose(); // Close panel after deletion
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  // Don't render if no task is provided
  if (!task) return null;

  return (
    <TaskDetailPanel
      task={latestTask || task}
      isOpen={isOpen}
      onClose={onClose}
      // Task operation handlers
      onSave={handleSave}
      onSaveDescription={handleDescriptionSave}
      onStatusChange={handleStatusChange}
      onPriorityChange={handlePriorityChange}
      onDelete={handleDelete}
      onFileUploadComplete={handleFileUploadComplete}
      onRemoveAttachment={handleRemoveAttachment}
      onTaskRefresh={handleTaskRefresh}
      // Project Task API configuration
      taskType="project"
      // Pass computed assignees - data already has correct avatar URLs
      computedAssignees={computedAssignees}
      // Override comment system with project-specific data and handlers
      overrideComments={true}
      projectComments={projectComments}
      projectActivities={projectActivities}
      commentsLoading={commentsLoading}
      activitiesLoading={activitiesLoading}
      newComment={newComment}
      onNewCommentChange={setNewComment}
      onCreateComment={handleCreateComment}
      onDeleteComment={handleDeleteComment}
      onEditComment={handleEditComment}
      commentSubmitting={commentSubmitting}
      // Pass down editing state and handlers
      editingCommentId={editingCommentId}
      editingCommentContent={editingCommentContent}
      onEditCommentChange={setEditingCommentContent}
      onEditCommentSubmit={handleEditCommentSubmit}
      onEditCommentCancel={handleEditCommentCancel}
    />
  );
};

export default ProjectTaskDetailPanel;
