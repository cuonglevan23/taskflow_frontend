import React from 'react';
import CommentItem from './CommentItem';
import { useTaskComments, useCommentActions } from '@/hooks/useComments';

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

  const { deleteComment } = useCommentActions(numericTaskId || 0);

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    // Show user-friendly error messages
    if (error.message?.includes('Access denied')) {
      return <div className="text-yellow-500">You don&apos;t have permission to view comments for this task.</div>;
    } else if (error.message?.includes('not found')) {
      return <div className="text-yellow-500">This task was not found or you don&apos;t have access to it.</div>;
    } else if (error.message?.includes('Authentication required')) {
      return <div className="text-red-500">Please log in again to view comments.</div>;
    }
    return <div className="text-red-500">Error loading comments. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments ({total})</h3>
      
      {comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={(commentId, content) => {
                // Simple update - would need CommentService.updateComment if implemented
                console.log('Update comment:', commentId, content);
              }}
              onDelete={deleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsList;