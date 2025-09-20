import React, { useState } from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useTaskActivities } from '@/hooks/useTaskActivities';
import CommentsList from './CommentsList';
import ProjectCommentsList from './ProjectCommentsList';
import TaskActivityList from './TaskActivityList';

type TabType = 'comments' | 'activity';

interface TaskCommentsActivityProps {
  taskId: string | null;
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
  editingCommentId?: string | null;
  editingCommentContent?: string;
  onEditComment?: (commentId: string, currentContent: string) => void;
  onEditCommentChange?: (value: string) => void;
  onEditCommentSubmit?: () => void;
  onEditCommentCancel?: () => void;
  onDeleteComment?: (commentId: string) => void;
}

const TaskCommentsActivity: React.FC<TaskCommentsActivityProps> = ({
  taskId,
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

  const [activeTab, setActiveTab] = useState<TabType>('comments');

  // Conditionally fetch task activities using the custom hook only if not using project override
  const {
    activities: hookActivities,
    groupedActivities: hookGroupedActivities,
    isLoading: hookActivitiesLoading
  } = useTaskActivities({
    taskId: taskId || '',
    enabled: !!taskId && activeTab === 'activity' && !overrideComments,
    pollInterval: 30000 // Refresh every 30 seconds when tab is active
  });

  // Use project activities or hook activities based on override flag
  const activities = overrideComments ? (projectActivities || []) : (hookActivities || []);
  const isActivitiesLoading = overrideComments ? (activitiesLoading || false) : hookActivitiesLoading;

  // Use project activities directly without complex grouping logic - let service handle it
  const groupedActivities = overrideComments
    ? { TODAY: projectActivities || [], YESTERDAY: [], EARLIER: [] }
    : (hookGroupedActivities || { TODAY: [], YESTERDAY: [], EARLIER: [] });

  return (
    <div
      className="space-y-6 border-t pt-6"
      style={{ borderColor: theme.border.default }}
    >
      {/* Tabs */}
      <div className="flex gap-6">
        <button
          className="pb-3 text-sm font-medium transition-colors border-b-2"
          style={{
            color: activeTab === 'comments' ? theme.text.primary : theme.text.muted,
            borderColor: activeTab === 'comments' ? theme.text.primary : 'transparent'
          }}
          onClick={() => setActiveTab('comments')}
        >
          {t('taskCommentsActivity.comments')}
        </button>

        <button
          className="pb-3 text-sm font-medium transition-colors border-b-2"
          style={{
            color: activeTab === 'activity' ? theme.text.primary : theme.text.muted,
            borderColor: activeTab === 'activity' ? theme.text.primary : 'transparent'
          }}
          onClick={() => setActiveTab('activity')}
        >
          {t('taskCommentsActivity.allActivity')}
          {activities.length > 0 && (
            <span
              className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: theme.background.secondary,
                color: theme.text.secondary
              }}
            >
              {activities.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'comments' ? (
          /* Comments Content - Conditionally render based on override flag */
          overrideComments ? (
            /* Project-specific comments rendering */
            <ProjectCommentsList
              comments={projectComments || []}
              loading={commentsLoading || false}
              editingCommentId={editingCommentId}
              editingCommentContent={editingCommentContent}
              onEditComment={onEditComment}
              onEditCommentChange={onEditCommentChange}
              onEditCommentSubmit={onEditCommentSubmit}
              onEditCommentCancel={onEditCommentCancel}
              onDeleteComment={onDeleteComment}
            />
          ) : (
            /* Regular comments using existing CommentsList component */
            <CommentsList taskId={taskId} />
          )
        ) : (
          /* Activity Content */
          <TaskActivityList
            activities={activities}
            groupedActivities={groupedActivities}
            isLoading={isActivitiesLoading}
          />
        )}
      </div>
    </div>
  );
};

export default TaskCommentsActivity;
