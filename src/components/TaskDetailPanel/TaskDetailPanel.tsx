"use client";

import React, { useState } from 'react';
import { TaskListItem } from '@/components/TaskList/types';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import TaskDetailHeader from './TaskDetailHeader';
import TaskDetailContent from './TaskDetailContent';
import TaskDetailFooter, { TaskDetailFooterProps } from './TaskDetailFooter';

interface TaskDetailPanelProps {
  task: TaskListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskId: string, updates: Partial<TaskListItem>) => void;
  onSaveDescription?: (taskId: string, description: string) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;
  onPriorityChange?: (taskId: string, priority: string) => void;
  // 🔥 Add new handler props for comprehensive task updates
  onDueDateChange?: (taskId: string, dueDate: string) => void;
  onStartDateChange?: (taskId: string, startDate: string) => void;
  onAssigneeChange?: (taskId: string, assigneeData: { id: string; name: string; email: string }) => void;
  onProjectChange?: (taskId: string, projectId: string) => void;
  onFileUploadComplete?: (result: any) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  onTaskRefresh?: () => void;

  // NEW: Add taskType prop to determine which API to use
  taskType?: 'mytask' | 'project';

  // Computed assignees from ProjectTaskAssignees - replaces old calculations
  computedAssignees?: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;

  // Project-specific comment override props
  overrideComments?: boolean;
  projectComments?: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
    };
    createdAt: string;
    updatedAt: string;
    isEdited?: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }>;
  projectActivities?: Array<{
    id: string;
    description: string;
    author: {
      name: string;
      avatar?: string | null;
    };
    createdAt: string;
    timeAgo: string;
    activityType: string;
  }>;
  commentsLoading?: boolean;
  activitiesLoading?: boolean;
  newComment?: string;
  onNewCommentChange?: (value: string) => void;
  onCreateComment?: () => void;
  onDeleteComment?: (commentId: string) => void;
  onEditComment?: (commentId: string, currentContent: string) => void;
  commentSubmitting?: boolean;
  // Edit comment props
  editingCommentId?: string | null;
  editingCommentContent?: string;
  onEditCommentChange?: (value: string) => void;
  onEditCommentSubmit?: () => void;
  onEditCommentCancel?: () => void;
}

const TaskDetailPanel = ({
  task,
  isOpen,
  onClose,
  onSave,
  onSaveDescription,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onStartDateChange,
  onAssigneeChange,
  onProjectChange,
  onFileUploadComplete,
  onRemoveAttachment,
  onTaskRefresh,
  taskType = 'mytask', // NEW: Default to mytask
  // Computed assignees from ProjectTaskAssignees - replaces old calculations
  computedAssignees = [],
  // Project-specific comment override props
  overrideComments,
  projectComments,
  projectActivities,
  commentsLoading,
  activitiesLoading,
  newComment,
  onNewCommentChange,
  onCreateComment,
  onDeleteComment,
  onEditComment,
  commentSubmitting,
  editingCommentId,
  editingCommentContent,
  onEditCommentChange,
  onEditCommentSubmit,
  onEditCommentCancel
}: TaskDetailPanelProps) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get nested translation
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // fallback to key if translation not found
      }
    }
    return String(value);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

  React.useEffect(() => {
    if (task) {
      setTitle(task.name || '');
      setDescription(task.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [task]);

  const handleSave = () => {
    if (task && onSave) {
      onSave(task.id, {
        name: title,
        description: description
      });
    }
  };

  const handleDescriptionSave = (newDescription: string) => {
    if (task && onSaveDescription) {
      onSaveDescription(task.id, newDescription);
    }
  };

  const handleFileUpload = (result: any) => {
    if (onFileUploadComplete) {
      onFileUploadComplete(result);
    }
    setFileRefreshTrigger(prev => prev + 1);
  };

  // Handle mark complete functionality
  const handleMarkComplete = () => {
    if (task && onStatusChange) {
      // Toggle between completed and in progress
      const isCompleted = task.completed || task.status === 'DONE';
      const newStatus = isCompleted ? 'IN_PROGRESS' : 'DONE';
      onStatusChange(task.id, newStatus);
    }
  };

  if (!isOpen) return null;

  return (
      <div
          className={`fixed top-12 right-0 w-[700px] h-[calc(100vh-4rem)] border-l shadow-2xl z-[55] flex flex-col
    transform transition-transform transition-opacity duration-300 ease-in-out
    ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default
          }}
      >
        <TaskDetailHeader
            task={task}
            onClose={onClose}
            onMarkComplete={handleMarkComplete}
            onFileUploadComplete={handleFileUpload}
        />

        <TaskDetailContent
            task={task}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            onSave={handleSave}
            onSaveDescription={handleDescriptionSave}
            onTaskStatusChange={onStatusChange}
            onTaskPriorityChange={onPriorityChange}
            onDueDateChange={onDueDateChange}
            onStartDateChange={onStartDateChange}
            onAssigneeChange={onAssigneeChange}
            onProjectChange={onProjectChange}
            onRemoveAttachment={onRemoveAttachment}
            fileRefreshTrigger={fileRefreshTrigger}
            onTaskRefresh={onTaskRefresh}
            // 🔥 FIXED: Pass taskType prop down to TaskDetailContent
            taskType={taskType}
            // Pass computed assignees from ProjectTaskAssignees
            computedAssignees={computedAssignees}
            // Pass project-specific comment and activity data
            overrideComments={overrideComments}
            projectComments={projectComments}
            projectActivities={projectActivities}
            commentsLoading={commentsLoading}
            activitiesLoading={activitiesLoading}
            // FIXED: Pass down all comment editing props
            editingCommentId={editingCommentId}
            editingCommentContent={editingCommentContent}
            onEditComment={onEditComment}
            onEditCommentChange={onEditCommentChange}
            onEditCommentSubmit={onEditCommentSubmit}
            onEditCommentCancel={onEditCommentCancel}
            onDeleteComment={onDeleteComment}
        />

        <TaskDetailFooter
            task={task}
            comment={overrideComments ? (newComment || '') : comment}
            setComment={overrideComments ? (onNewCommentChange || (() => {})) : setComment}
            // Pass computed assignees to footer
            computedAssignees={computedAssignees}
            // Pass project-specific comment handlers
            overrideComments={overrideComments}
            onCreateComment={onCreateComment}
            onDeleteComment={onDeleteComment}
            onEditComment={onEditComment}
            commentSubmitting={commentSubmitting}
            editingCommentId={editingCommentId}
            editingCommentContent={editingCommentContent}
            onEditCommentChange={onEditCommentChange}
            onEditCommentSubmit={onEditCommentSubmit}
            onEditCommentCancel={onEditCommentCancel}
        />
      </div>
  );
};

export default TaskDetailPanel;
