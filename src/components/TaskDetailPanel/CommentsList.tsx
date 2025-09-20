import React from 'react';
import CommentItem from './CommentItem';
import { useTaskComments, useCommentActions } from '@/hooks/useComments';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface CommentsListProps {
  taskId: string | null;
  currentUserEmail?: string;
}

const CommentsList: React.FC<CommentsListProps> = ({ taskId }) => {
  const numericTaskId = typeof taskId === 'string' ? parseInt(taskId) : taskId;
  
  const {
    comments,
    total,
    isLoading,
    error
  } = useTaskComments(numericTaskId);

  const { deleteComment, updateComment, isSubmitting } = useCommentActions(numericTaskId || 0);

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

  const handleEditComment = async (commentId: number, content: string) => {
    try {
      await updateComment(commentId, content);
    } catch (error) {
      console.error('Failed to update comment:', error);
      // You might want to show a toast notification here
      alert(t('commentsList.updateError'));
    }
  };

  if (isLoading) {
    return <div style={{ color: theme.text.muted }}>{t('commentsList.loading')}</div>;
  }

  if (error) {
    // Show user-friendly error messages
    if (error.message?.includes('Access denied')) {
      return <div className="text-yellow-500" style={{ color: theme.status.warning }}>{t('commentsList.errors.accessDenied')}</div>;
    } else if (error.message?.includes('not found')) {
      return <div className="text-yellow-500" style={{ color: theme.status.warning }}>{t('commentsList.errors.notFound')}</div>;
    } else if (error.message?.includes('Authentication required')) {
      return <div className="text-red-500" style={{ color: theme.status.error }}>{t('commentsList.errors.authRequired')}</div>;
    }
    return <div className="text-red-500" style={{ color: theme.status.error }}>{t('commentsList.errors.loadError')}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
        {t('commentsList.title').replace('{count}', total.toString())}
      </h3>

      {comments.length === 0 ? (
        <p className="text-gray-500" style={{ color: theme.text.muted }}>{t('commentsList.noComments')}</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleEditComment}
              onDelete={deleteComment}
              isEditing={isSubmitting}
              isDeleting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsList;