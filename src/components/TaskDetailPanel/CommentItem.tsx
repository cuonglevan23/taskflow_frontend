import React, { useState } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { TaskComment } from '@/types/comment';
import { DARK_THEME } from '@/constants/theme';

interface CommentItemProps {
  comment: TaskComment;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  isEditing?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const CommentItem = ({
  comment,
  onEdit,
  onDelete,
  isEditing = false,
  isDeleting = false,
  canEdit = true,
  canDelete = true,
}: CommentItemProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);

  const handleSaveEdit = () => {
    if (editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditMode(false);
  };

  const formatTimeAgo = (date: Date | string) => {
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(parsedDate.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  return (
    <div 
      className="flex items-start gap-3 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <UserAvatar
        name={comment.userName}
        avatar={comment.userAvatar || undefined}
        size="sm"
        className="w-8 h-8"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-400 font-medium text-sm">{comment.userName}</span>
          <span className="text-gray-500 text-xs">· {formatTimeAgo(new Date(comment.createdAt))}</span>
          {comment.isEdited && (
            <span className="text-gray-500 text-xs">(edited)</span>
          )}
          
          {/* Action buttons */}
          {showActions && !isEditMode && (canEdit || canDelete) && (
            <div className="flex items-center gap-1 ml-auto">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                  disabled={isEditing}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {isEditMode ? (
          <div 
            className="rounded-lg overflow-hidden border"
            style={{
              backgroundColor: DARK_THEME.background.weakHover,
              borderColor: DARK_THEME.border.default
            }}
          >
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[80px] p-3 bg-transparent border-none outline-none resize-none text-white placeholder:text-gray-400 text-sm"
              placeholder="Edit your comment..."
              autoFocus
            />
            <div 
              className="flex items-center justify-end gap-2 p-2 border-t"
              style={{
                backgroundColor: DARK_THEME.sidebar.background,
                borderColor: DARK_THEME.border.default
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-200 text-sm h-7 px-3"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-7 px-3"
                disabled={isEditing || !editContent.trim()}
              >
                <Check className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="text-sm text-gray-200 rounded-lg p-3 border"
            style={{
              backgroundColor: DARK_THEME.background.weakHover,
              borderColor: DARK_THEME.border.default
            }}
          >
            {comment.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
