import React from 'react';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

interface ProjectComment {
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
}

interface ProjectCommentsListProps {
  comments: ProjectComment[];
  loading: boolean;
  editingCommentId?: string | null;
  editingCommentContent?: string;
  onEditComment?: (commentId: string, currentContent: string) => void;
  onEditCommentChange?: (value: string) => void;
  onEditCommentSubmit?: () => void;
  onEditCommentCancel?: () => void;
  onDeleteComment?: (commentId: string) => void;
}

const ProjectCommentsList: React.FC<ProjectCommentsListProps> = ({
  comments,
  loading,
  editingCommentId,
  editingCommentContent,
  onEditComment,
  onEditCommentChange,
  onEditCommentSubmit,
  onEditCommentCancel,
  onDeleteComment
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-400">Loading comments...</div>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-gray-400">No comments yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4">
        {comments.length} comment{comments.length !== 1 ? 's' : ''}
      </div>
      {comments.map((comment) => {
        const isEditing = editingCommentId === comment.id;

        return (
          <div key={comment.id} className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <UserAvatar
              name={comment.author.name || comment.author.email || 'Comment Author'}
              email={comment.author.email || `comment${comment.id}@unknown.com`}
              avatar={comment.author.avatar}
              size="sm"
              className="w-10 h-10 mt-1 flex-shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white">
                  {comment.author.name || comment.author.email || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {comment.createdAt !== comment.updatedAt && (
                  <span className="text-xs text-gray-500">(edited)</span>
                )}
              </div>

              {/* Comment Content - Edit Mode or View Mode */}
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editingCommentContent || comment.content}
                    onChange={(e) => onEditCommentChange?.(e.target.value)}
                    className="w-full p-3 text-sm bg-gray-700 border border-gray-600 rounded resize-none text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Edit your comment..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={onEditCommentSubmit}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={onEditCommentCancel}
                      className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </div>
              )}

              {/* Comment Actions - Only show when not editing */}
              {!isEditing && (
                <div className="flex items-center gap-3 pt-1">
                  {comment.canEdit && (
                    <button
                      onClick={() => onEditComment?.(comment.id, comment.content)}
                      className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {comment.canDelete && (
                    <button
                      onClick={() => onDeleteComment?.(comment.id)}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectCommentsList;
