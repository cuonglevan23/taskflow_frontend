import React, { useState } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { TaskComment } from '@/types/comment';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

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
        return t('commentItem.invalidDate');
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) return t('commentItem.timeAgo.justNow');
      if (diffInSeconds < 3600) return t('commentItem.timeAgo.minutesAgo').replace('{minutes}', Math.floor(diffInSeconds / 60).toString());
      if (diffInSeconds < 86400) return t('commentItem.timeAgo.hoursAgo').replace('{hours}', Math.floor(diffInSeconds / 3600).toString());
      return t('commentItem.timeAgo.daysAgo').replace('{days}', Math.floor(diffInSeconds / 86400).toString());
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('commentItem.unknown');
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
        email={comment.userEmail}
        avatar={comment.userAvatar || undefined}
        size="sm"
        className="w-8 h-8"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-400 font-medium text-sm">{comment.userName}</span>
          <span className="text-gray-500 text-xs">· {formatTimeAgo(new Date(comment.createdAt))}</span>
          {comment.isEdited && (
            <span className="text-gray-500 text-xs">({t('commentItem.edited')})</span>
          )}
          
          {/* Action buttons */}
          {showActions && !isEditMode && (canEdit || canDelete) && (
            <div className="flex items-center gap-1 ml-auto">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="h-6 w-6 p-0"
                  style={{ color: theme.text.muted }}
                  disabled={isEditing}
                  title={t('commentItem.edit')}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment.id)}
                  className="h-6 w-6 p-0"
                  style={{ color: theme.text.muted }}
                  disabled={isDeleting}
                  title={t('commentItem.delete')}
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
              backgroundColor: theme.background.weakHover,
              borderColor: theme.border.default
            }}
          >
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[80px] p-3 bg-transparent border-none outline-none resize-none text-sm"
              style={{ color: theme.text.primary }}
              placeholder={t('commentItem.editPlaceholder')}
              autoFocus
            />
            <div 
              className="flex items-center justify-end gap-2 p-2 border-t"
              style={{
                backgroundColor: theme.sidebar.background,
                borderColor: theme.border.default
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-sm h-7 px-3"
                style={{ color: theme.text.muted }}
              >
                <X className="w-3 h-3 mr-1" />
                {t('commentItem.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="text-sm h-7 px-3"
                style={{
                  backgroundColor: theme.button.primary.background,
                  color: 'white'
                }}
                disabled={isEditing || !editContent.trim()}
              >
                <Check className="w-3 h-3 mr-1" />
                {t('commentItem.save')}
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="text-sm rounded-lg p-3 border"
            style={{
              backgroundColor: theme.background.weakHover,
              borderColor: theme.border.default,
              color: theme.text.primary
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
