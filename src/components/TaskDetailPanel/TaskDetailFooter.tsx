import React, { useState } from 'react';
import { Plus, Triangle, Smile, AtSign, Star, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { TaskListItem } from '@/components/TaskList/types';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { useCommentActions } from '@/hooks/useComments';
import { useAuth } from '@/components/auth/AuthProvider';

export interface TaskDetailFooterProps {
  task: TaskListItem | null;
  comment: string;
  setComment: ((comment: string) => void) | ((value: string) => void);

  // Computed assignees from ProjectTaskAssignees - replaces old calculations
  computedAssignees?: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;

  // Project-specific comment override props
  overrideComments?: boolean;
  onCreateComment?: () => void;
  commentSubmitting?: boolean;
}

const TaskDetailFooter = ({
  task,
  comment,
  setComment,
  computedAssignees,
  overrideComments,
  onCreateComment,
  commentSubmitting,
}: TaskDetailFooterProps) => {
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  
  // Get current user
  const { user } = useAuth();

  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // Get task ID
  const taskId = task?.id ? String(task.id) : null;
  const numericTaskId = taskId ? parseInt(taskId, 10) : null;
  
  // Use the comments hook for actions
  const { addComment, isSubmitting } = useCommentActions(numericTaskId);
  
  // Handle comment submission
  const handleCreateComment = async () => {
    if (!comment?.trim()) return;

    try {
      if (overrideComments && onCreateComment) {
        // Use project-specific comment creation
        await onCreateComment();
        setShowCommentEditor(false);
      } else {
        // Use generic comment creation
        await addComment(comment.trim());
        setComment('');
        setShowCommentEditor(false);
      }
    } catch (error: unknown) {
      console.error('Failed to create comment:', error);
      // Keep the editor open so user can try again
    }
  };

  // Determine if we're submitting based on override or generic system
  const isCommentSubmitting = overrideComments ? (commentSubmitting || false) : isSubmitting;

  return (
    <div 
      className="border-t"
      style={{ 
        borderColor: theme.border.default,
        backgroundColor: theme.background.primary
      }}
    >
      {/* Add Comment UI */}
      <div className="p-6">
        <h3 className="text-sm font-medium mb-4" style={{ color: theme.text.primary }}>
          {t('taskDetailFooter.addComment')}
        </h3>
        <div className="flex items-start gap-3">
          <UserAvatar
            name={user?.name || user?.email || t('taskDetailFooter.currentUser')}
            email={user?.email || 'unknown@email.com'}
            avatar={user?.avatar}
            size="sm"
            className="w-8 h-8"
          />
          <div className="flex-1">
            {showCommentEditor ? (
              <div 
                className="rounded-lg overflow-hidden border shadow-md transition-all duration-200"
                style={{
                  backgroundColor: theme.sidebar.background,
                  borderColor: theme.border.focus,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div className="p-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('taskDetailFooter.commentPlaceholder')}
                    autoFocus
                    className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-sm placeholder:opacity-60"
                    style={{
                      color: theme.text.primary
                    }}
                  />
                </div>
                <div 
                  className="flex items-center justify-between p-3 border-t"
                  style={{
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.muted
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon toolbar */}
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 rounded transition-colors hover:opacity-80"
                        style={{ color: theme.text.muted }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded transition-colors hover:opacity-80"
                        style={{ color: theme.text.muted }}
                      >
                        <Triangle className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded transition-colors hover:opacity-80"
                        style={{ color: theme.text.muted }}
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded transition-colors hover:opacity-80"
                        style={{ color: theme.text.muted }}
                      >
                        <AtSign className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded transition-colors hover:opacity-80"
                        style={{ color: theme.text.muted }}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded transition-colors hover:opacity-80"
                        style={{ color: theme.text.muted }}
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded transition-colors hover:opacity-80"
                        style={{ color: theme.text.muted }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs ml-4" style={{ color: theme.text.muted }}>
                      <span>{t('taskDetailFooter.notificationCount')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCommentEditor(false)}
                      className="text-sm h-8 px-3 transition-colors"
                      style={{ color: theme.text.muted }}
                    >
                      {t('taskDetailFooter.cancel')}
                    </Button>
                    <Button
                      size="sm"
                      className="text-sm h-8 px-4 font-medium transition-colors shadow-sm"
                      style={{
                        backgroundColor: theme.button.primary.background,
                        color: theme.button.primary.text
                      }}
                      onClick={handleCreateComment}
                      disabled={isCommentSubmitting || !comment?.trim()}
                    >
                      {isCommentSubmitting ? t('taskDetailFooter.posting') : t('taskDetailFooter.comment')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="min-h-[52px] border rounded-lg p-4 cursor-text transition-all duration-200 ease-in-out flex items-center hover:shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                tabIndex={0}
                role="button"
                aria-label={t('taskDetailFooter.addCommentAriaLabel')}
                style={{
                  backgroundColor: theme.sidebar.background,
                  borderColor: theme.border.muted
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                  e.currentTarget.style.borderColor = theme.border.focus;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.sidebar.background;
                  e.currentTarget.style.borderColor = theme.border.muted;
                }}
                onClick={() => setShowCommentEditor(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowCommentEditor(true);
                  }
                }}
              >
                <span className="text-sm" style={{ color: theme.text.muted }}>
                  {t('taskDetailFooter.addCommentPlaceholder')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collaborators */}
      <div 
        className="px-6 py-4 border-t"
        style={{
          backgroundColor: `${theme.background.weakHover}60`,
          borderColor: theme.border.default
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
              {t('taskDetailFooter.collaborators')}
            </span>
            <div className="flex items-center gap-1">
              {computedAssignees?.slice(0, 3).map((assignee, index) => (
                <UserAvatar
                  key={assignee.id || index}
                  name={assignee.name}
                  email={assignee.email}
                  avatar={assignee.avatar}
                  size="sm"
                  className="w-8 h-8 -ml-1 first:ml-0 border-2"
                  style={{ borderColor: theme.background.primary }}
                />
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-full border-2 border-dashed -ml-1 hover:opacity-80"
                style={{
                  borderColor: theme.border.muted,
                  color: theme.text.muted
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailFooter;
