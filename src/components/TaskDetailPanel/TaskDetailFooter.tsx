import React, { useState } from 'react';
import { Plus, Globe, Triangle, Smile, AtSign, Star, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { TaskListItem } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';
import { useCommentActions } from '@/hooks/useComments';
import { useAuth } from '@/components/auth/AuthProvider';

interface TaskDetailFooterProps {
  task: TaskListItem | null;
  comment: string;
  setComment: (comment: string) => void;
}

const TaskDetailFooter = ({
  task,
  comment,
  setComment
}: TaskDetailFooterProps) => {
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  
  // Get current user
  const { user } = useAuth();

  // Get task ID
  const taskId = task?.id ? String(task.id) : null;
  const numericTaskId = taskId ? parseInt(taskId, 10) : null;
  
  // Use the comments hook for actions
  const { addComment, isSubmitting } = useCommentActions(numericTaskId);
  
  // Handle comment submission
  const handleCreateComment = async () => {
    if (!comment.trim()) return;
    
    try {
      await addComment(comment.trim());
      setComment('');
      setShowCommentEditor(false);
    } catch (error: unknown) {
      console.error('Failed to create comment:', error);
      // Error notification is already handled in the hook
      // Keep the editor open so user can try again
    }
  };

  return (
    <div 
      className="border-t"
      style={{ 
        borderColor: DARK_THEME.border.default,
        backgroundColor: DARK_THEME.background.primary
      }}
    >
      {/* Add Comment UI */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-white mb-4">Add Comment</h3>
        <div className="flex items-start gap-3">
          <UserAvatar
            name={user?.name || user?.email || 'Current User'}
            avatar={user?.avatar}
            size="sm"
            className="w-8 h-8"
          />
          <div className="flex-1">
            {showCommentEditor ? (
              <div 
                className="rounded-lg overflow-hidden border shadow-md transition-all duration-200"
                style={{
                  backgroundColor: DARK_THEME.sidebar.background,
                  borderColor: DARK_THEME.border.focus,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div className="p-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment"
                    autoFocus
                    className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-white placeholder:text-gray-400 text-sm"
                  />
                </div>
                <div 
                  className="flex items-center justify-between p-3 border-t"
                  style={{
                    backgroundColor: DARK_THEME.background.secondary,
                    borderColor: DARK_THEME.border.muted
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon toolbar */}
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
                        <Triangle className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
                        <Smile className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
                        <AtSign className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
                        <Star className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 ml-4">
                      <span>0 people will be notified</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCommentEditor(false)}
                      className="text-gray-300 hover:text-white text-sm h-8 px-3 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-sm h-8 px-4 font-medium transition-colors shadow-sm"
                      onClick={handleCreateComment}
                      disabled={isSubmitting || !comment.trim()}
                    >
                      {isSubmitting ? 'Posting...' : 'Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="min-h-[52px] border rounded-lg p-4 cursor-text transition-all duration-200 ease-in-out flex items-center hover:shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                tabIndex={0}
                role="button"
                aria-label="Add a comment"
                style={{
                  backgroundColor: DARK_THEME.sidebar.background,
                  borderColor: DARK_THEME.border.muted
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.background.secondary;
                  e.currentTarget.style.borderColor = DARK_THEME.border.focus;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.background;
                  e.currentTarget.style.borderColor = DARK_THEME.border.muted;
                }}
                onClick={() => setShowCommentEditor(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowCommentEditor(true);
                  }
                }}
              >
                <span className="text-gray-400 text-sm">Add a comment...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collaborators */}
      <div 
        className="px-6 py-4 border-t"
        style={{
          backgroundColor: `${DARK_THEME.background.weakHover}60`,
          borderColor: DARK_THEME.border.default
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">Collaborators</span>
            <div className="flex items-center gap-1">
              {task?.assignees?.slice(0, 3).map((assignee) => (
                <UserAvatar
                  key={assignee.id}
                  name={assignee.name}
                  avatar={assignee.avatar}
                  size="sm"
                  className="w-8 h-8 -ml-1 first:ml-0 border-2 border-gray-900"
                />
              ))}
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 -ml-1">
                <Plus className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 -ml-1">
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
