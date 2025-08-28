import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { CommentService } from '@/services/commentService';
import type { CommentListResponse, TaskComment } from '@/types/comment';

// Simple SWR-based comment count hook - replaces complex cache manager
export function useTaskCommentCount(taskId: number | null | string) {
  const numericTaskId = taskId !== null && typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
  
  const { data, error, isLoading } = useSWR<{ commentCount: number }>(
    numericTaskId ? `/api/task-comments/task/${numericTaskId}/count` : null,
    numericTaskId ? () => CommentService.getCommentCount(numericTaskId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds cache
      errorRetryCount: 1,
      errorRetryInterval: 2000,
    }
  );

  return {
    count: data?.commentCount || 0,
    isLoading,
    error,
  };
}

// SWR-based comments list hook
export function useTaskComments(taskId: number | null | string, page = 0, size = 10) {
  const numericTaskId = taskId !== null && typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
  
  const { data, error, isLoading, mutate: revalidate } = useSWR<CommentListResponse>(
    numericTaskId ? `/api/task-comments/task/${numericTaskId}` : null,
    numericTaskId ? () => CommentService.getTaskComments(numericTaskId, page, size) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      errorRetryCount: 1,
      errorRetryInterval: 2000,
    }
  );

  return {
    comments: data?.comments || [],
    total: data?.total || 0,
    isLoading,
    error,
    revalidate,
  };
}

// Simple SWR mutate functions - no complex cache manager!
export const commentMutations = {
  // Update comment count using SWR mutate
  updateCommentCount: (taskId: number, delta: number) => {
    const countKey = `/api/task-comments/task/${taskId}/count`;
    mutate(countKey, (current: { commentCount: number } = { commentCount: 0 }) => ({
      commentCount: Math.max(0, current.commentCount + delta)
    }), false);
  },

  // Invalidate caches for fresh data
  invalidateTaskComments: (taskId: number) => {
    const countKey = `/api/task-comments/task/${taskId}/count`;
    const commentsKey = `/api/task-comments/task/${taskId}`;
    
    mutate(countKey, undefined, { revalidate: true });
    mutate(commentsKey, undefined, { revalidate: true });
  },

  // Optimistic updates for instant UI feedback
  addCommentOptimistic: (taskId: number, comment: TaskComment) => {
    const commentsKey = `/api/task-comments/task/${taskId}`;
    const countKey = `/api/task-comments/task/${taskId}/count`;
    
    // Update comments list
    mutate(commentsKey, (current: CommentListResponse | undefined) => {
      if (!current) return current;
      return {
        ...current,
        comments: [comment, ...current.comments],
        total: current.total + 1
      };
    }, false);
    
    // Update count
    mutate(countKey, (current: { commentCount: number } = { commentCount: 0 }) => ({
      commentCount: current.commentCount + 1
    }), false);
  },

  deleteCommentOptimistic: (taskId: number, commentId: number) => {
    const commentsKey = `/api/task-comments/task/${taskId}`;
    const countKey = `/api/task-comments/task/${taskId}/count`;
    
    // Update comments list
    mutate(commentsKey, (current: CommentListResponse | undefined) => {
      if (!current) return current;
      return {
        ...current,
        comments: current.comments.filter(c => c.id !== commentId),
        total: Math.max(0, current.total - 1)
      };
    }, false);
    
    // Update count
    mutate(countKey, (current: { commentCount: number } = { commentCount: 0 }) => ({
      commentCount: Math.max(0, current.commentCount - 1)
    }), false);
  }
};

// Hook for comment actions with optimistic updates
export function useCommentActions(taskId: number | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = useCallback(async (content: string) => {
    if (!content.trim() || isSubmitting || !taskId) return;

    setIsSubmitting(true);
    try {
      const newComment = await CommentService.createComment({ 
        taskId, 
        content 
      });
      
      // Optimistic update
      commentMutations.addCommentOptimistic(taskId, newComment);
      
      return newComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      if (taskId) {
        commentMutations.invalidateTaskComments(taskId);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [taskId, isSubmitting]);

  const deleteComment = useCallback(async (commentId: number | string) => {
    if (!taskId) return;
    
    try {
      const numericCommentId = typeof commentId === 'string' ? parseInt(commentId, 10) : commentId;
      
      // Optimistic update
      commentMutations.deleteCommentOptimistic(taskId, numericCommentId);
      
      await CommentService.deleteComment(numericCommentId);
      
    } catch (error) {
      console.error('Failed to delete comment:', error);
      commentMutations.invalidateTaskComments(taskId);
      throw error;
    }
  }, [taskId]);

  return {
    addComment,
    deleteComment,
    isSubmitting
  };
}

// Legacy alias for backward compatibility  
export const useCommentCount = useTaskCommentCount;
