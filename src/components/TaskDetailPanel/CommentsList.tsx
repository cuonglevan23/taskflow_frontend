import React, { useState } from 'react';
import { Plus, Triangle, Smile, AtSign, Star, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar/Avatar';
import CommentItem from './CommentItem';
import { useTaskComments, useCommentActions, useCommentCount } from '@/hooks/useComments';
import { DARK_THEME } from '@/constants/theme';

interface CommentsListProps {
  taskId: string | null;
  currentUserEmail?: string;
}

const CommentsList = ({
  taskId,
  currentUserEmail = "cuonglv.21ad@vku.udn.vn"
}: CommentsListProps) => {
  const [newComment, setNewComment] = useState('');
  const [showCommentEditor, setShowCommentEditor] = useState(false);

  // Use custom hooks for data and actions
  const { comments, isLoading, error, revalidate } = useTaskComments(taskId);
  const { count: commentCount, isLoading: isCountLoading } = useCommentCount(taskId);
  const { createComment, updateComment, deleteComment, isCreating, isUpdating, isDeleting } = useCommentActions(taskId);

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment(newComment.trim());
      setNewComment('');
      setShowCommentEditor(false);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (!taskId) {
    return (
      <div className="text-gray-400 text-center py-8">
        Select a task to view comments
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        {[1, 2].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-600 rounded w-1/3 mb-2"></div>
              <div className="h-16 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        <div className="mb-2">Failed to load comments</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => revalidate()}
          className="text-blue-400 hover:text-blue-300"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Existing Comments */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-2">
            {commentCount} Comment{commentCount !== 1 ? 's' : ''}
          </div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              isEditing={isUpdating}
              isDeleting={isDeleting}
              canEdit={comment.authorEmail === currentUserEmail}
              canDelete={comment.authorEmail === currentUserEmail}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">
          <div className="text-lg mb-2">No comments yet</div>
          <div className="text-sm">Be the first to add a comment</div>
        </div>
      )}

      {/* Add Comment Section */}
      <div className="flex items-start gap-3">
        <Avatar
          name={currentUserEmail}
          size="sm"
          className="w-8 h-8 bg-pink-500"
        />
        <div className="flex-1">
          {showCommentEditor ? (
            <div 
              className="rounded-lg overflow-hidden border"
              style={{
                backgroundColor: DARK_THEME.background.weakHover,
                borderColor: DARK_THEME.border.default
              }}
            >
              <div className="p-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                  className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-white placeholder:text-gray-400 text-sm"
                />
              </div>
              <div 
                className="flex items-center justify-between p-3 border-t"
                style={{
                  backgroundColor: DARK_THEME.sidebar.background,
                  borderColor: DARK_THEME.border.default
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Icon toolbar */}
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-300 p-1">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 p-1">
                      <Triangle className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 p-1">
                      <Smile className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 p-1">
                      <AtSign className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 p-1">
                      <Star className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 p-1">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 p-1">
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
                    onClick={() => {
                      setShowCommentEditor(false);
                      setNewComment('');
                    }}
                    className="text-gray-400 hover:text-gray-200 text-sm h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateComment}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-8 px-4 font-medium"
                    disabled={isCreating || !newComment.trim()}
                  >
                    {isCreating ? 'Adding...' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="min-h-20 border rounded-lg p-4 cursor-text transition-all duration-200 ease-in-out flex items-center"
              style={{
                backgroundColor: DARK_THEME.background.weakHover,
                borderColor: DARK_THEME.border.default
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.background;
                e.currentTarget.style.borderColor = '#6B7280';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
                e.currentTarget.style.borderColor = DARK_THEME.border.default;
              }}
              onClick={() => setShowCommentEditor(true)}
            >
              <span className="text-gray-400 text-sm">Add a comment</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsList;
