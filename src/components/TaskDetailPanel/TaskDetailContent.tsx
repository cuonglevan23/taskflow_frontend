import React from 'react';
import { TaskListItem } from '@/components/TaskList/types';
import TaskTitle from './TaskTitle';
import TaskAssignees, { TaskDates, TaskProject } from './TaskFields';
import { TaskPriority, TaskStatus } from './TaskPriorityStatus';
import TaskDescriptionEditor from './TaskDescriptionEditor';
import GoogleCalendarIntegration from './GoogleCalendarIntegration';
import TaskFiles from './TaskFiles';
import TaskCommentsActivity from './TaskCommentsActivity';

interface TaskDetailContentProps {
  task: TaskListItem | null;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onSave: () => void;
  onSaveDescription?: (newDescription: string) => void;
  onTaskStatusChange?: (taskId: string, status: string) => void;
  onTaskPriorityChange?: (taskId: string, priority: string) => void;
  onDueDateChange?: (taskId: string, dueDate: string) => void;
  onStartDateChange?: (taskId: string, startDate: string) => void;
  onAssigneeChange?: (taskId: string, assigneeData: { id: string; name: string; email: string }) => void;
  onProjectChange?: (taskId: string, projectId: string) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  fileRefreshTrigger?: number;
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

  // Edit comment props - ADDED FOR COMMENT EDITING
  editingCommentId?: string | null;
  editingCommentContent?: string;
  onEditComment?: (commentId: string, currentContent: string) => void;
  onEditCommentChange?: (value: string) => void;
  onEditCommentSubmit?: () => void;
  onEditCommentCancel?: () => void;
  onDeleteComment?: (commentId: string) => void;
}

const TaskDetailContent: React.FC<TaskDetailContentProps> = ({
  task,
  title,
  setTitle,
  description,
  setDescription,
  onSave,
  onSaveDescription,
  onTaskStatusChange,
  onTaskPriorityChange,
  onDueDateChange,
  onStartDateChange,
  onAssigneeChange,
  onProjectChange,
  onRemoveAttachment,
  fileRefreshTrigger,
  onTaskRefresh,
  taskType = 'project',
  computedAssignees = [],
  overrideComments,
  projectComments,
  projectActivities,
  commentsLoading,
  activitiesLoading,
  editingCommentId,
  editingCommentContent,
  onEditComment,
  onEditCommentChange,
  onEditCommentSubmit,
  onEditCommentCancel,
  onDeleteComment
}) => {
  const taskId = task?.id ? String(task.id) : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 task-detail-content">
      {/* Task Title */}
      <TaskTitle
        task={task}
        title={title}
        setTitle={setTitle}
        onSave={onSave}
      />

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Assignee */}
        <TaskAssignees
          assignees={computedAssignees}
          onAssigneeChange={onAssigneeChange}
          taskId={taskId}
        />

        {/* Dates */}
        <TaskDates
          task={task}
          onDueDateChange={onDueDateChange}
          onStartDateChange={onStartDateChange}
        />

        {/* Projects */}
        <TaskProject
          task={task}
          onProjectChange={onProjectChange}
        />
      </div>

      {/* Priority & Status Section */}
      <div className="space-y-4">
        <TaskPriority
          task={task}
          onTaskPriorityChange={onTaskPriorityChange}
        />

        <TaskStatus
          task={task}
          onTaskStatusChange={onTaskStatusChange}
        />
      </div>

      {/* Task Description */}
      <TaskDescriptionEditor
        description={description}
        setDescription={setDescription}
        onSaveDescription={onSaveDescription}
      />

      {/* Google Calendar Integration Section */}
      {task && (
        <GoogleCalendarIntegration
          task={task}
          title={title}
          description={description}
          computedAssignees={computedAssignees}
          onTaskRefresh={onTaskRefresh}
          taskType={taskType} // 🔥 Use taskType from props instead of hardcoded
        />
      )}

      {/* Task Files Section */}
      <TaskFiles
        task={task}
        fileRefreshTrigger={fileRefreshTrigger}
        onRemoveAttachment={onRemoveAttachment}
      />

      {/* Comments & Activity Section */}
      <TaskCommentsActivity
        taskId={taskId}
        overrideComments={overrideComments}
        projectComments={projectComments}
        projectActivities={projectActivities}
        commentsLoading={commentsLoading}
        activitiesLoading={activitiesLoading}
        editingCommentId={editingCommentId}
        editingCommentContent={editingCommentContent}
        onEditComment={onEditComment}
        onEditCommentChange={onEditCommentChange}
        onEditCommentSubmit={onEditCommentSubmit}
        onEditCommentCancel={onEditCommentCancel}
        onDeleteComment={onDeleteComment}
      />
    </div>
  );
};

export default TaskDetailContent;
