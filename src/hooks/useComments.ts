import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { CommentService } from '@/services/commentService';
import type { CommentListResponse } from '@/types/comment';
import { useNotifications } from '@/contexts/NotificationContext';

// Hook for fetching task comments
export function useTaskComments(taskId: string | null, page = 0, size = 10) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<CommentListResponse>(
    taskId ? [`/api/task-comments/task/${taskId}`, page, size] : null,
    taskId ? () => CommentService.getTaskComments(taskId, page, size) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
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

// Hook to get comment count
export function useCommentCount(taskId: string | null) {
  const { data, error, isLoading } = useSWR(
    taskId ? `/api/task-comments/task/${taskId}/count` : null,
    taskId ? () => CommentService.getCommentCount(taskId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    count: data || 0,
    isLoading,
    error
  };
}

// Hook for comment CRUD operations
export function useCommentActions(taskId: string | null) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { actions: notificationActions } = useNotifications();

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    notificationActions.addNotification({
      title: type === 'success' ? 'Success' : 'Error',
      message,
      type: type === 'success' ? 'success' : 'error',
      priority: 'medium',
      status: 'unread',
    });
  }, [notificationActions]);

  const createComment = useCallback(async (content: string) => {
    if (!taskId) return;
    
    setIsCreating(true);
    try {
      const newComment = await CommentService.createComment({ taskId, content });
      
      // Optimistically update the cache
      mutate(
        [`/api/task-comments/task/${taskId}`, 0, 10],
        (data: CommentListResponse | undefined) => {
          if (!data) return data;
          return {
            ...data,
            comments: [newComment, ...data.comments],
            total: data.total + 1,
          };
        },
        false
      );
      
      // Update comment count cache
      mutate(
        `/api/task-comments/task/${taskId}/count`,
        (count: number | undefined) => {
          return (count || 0) + 1;
        },
        false
      );
      
      showNotification('Comment added successfully', 'success');
      return newComment;
    } catch (error) {
      showNotification('Failed to add comment', 'error');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [taskId, showNotification]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!taskId) return;
    
    setIsUpdating(true);
    try {
      const updatedComment = await CommentService.updateComment({ id: commentId, content });
      
      // Optimistically update the cache
      mutate(
        [`/api/task-comments/task/${taskId}`, 0, 10],
        (data: CommentListResponse | undefined) => {
          if (!data) return data;
          return {
            ...data,
            comments: data.comments.map(comment => 
              comment.id === commentId ? updatedComment : comment
            ),
          };
        },
        false
      );
      
      showNotification('Comment updated successfully', 'success');
      return updatedComment;
    } catch (error) {
      showNotification('Failed to update comment', 'error');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [taskId, showNotification]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!taskId) return;
    
    setIsDeleting(true);
    try {
      await CommentService.deleteComment(commentId);
      
      // Optimistically update the cache
      mutate(
        [`/api/task-comments/task/${taskId}`, 0, 10],
        (data: CommentListResponse | undefined) => {
          if (!data) return data;
          return {
            ...data,
            comments: data.comments.filter(comment => comment.id !== commentId),
            total: data.total - 1,
          };
        },
        false
      );
      
      // Update comment count cache
      mutate(
        `/api/task-comments/task/${taskId}/count`,
        (count: number | undefined) => {
          return Math.max(0, (count || 0) - 1);
        },
        false
      );
      
      showNotification('Comment deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete comment', 'error');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [taskId, showNotification]);

  return {
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

// Hook for task description management
export function useTaskDescription(taskId: string | null) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { actions: notificationActions } = useNotifications();

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    notificationActions.addNotification({
      title: type === 'success' ? 'Success' : 'Error',
      message,
      type: type === 'success' ? 'success' : 'error',
      priority: 'medium',
      status: 'unread',
    });
  }, [notificationActions]);

  const updateDescription = useCallback(async (description: string) => {
    if (!taskId) return;
    
    setIsUpdating(true);
    try {
      await CommentService.updateTaskDescription({ taskId, description });
      
      // Revalidate related cache
      mutate(`/api/tasks/${taskId}`, undefined, true);
      
      showNotification('Description updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update description', 'error');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [taskId, showNotification]);

  return {
    updateDescription,
    isUpdating,
  };
}

// Hook for task comment field management
export function useTaskCommentField(taskId: string | null) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { actions: notificationActions } = useNotifications();

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    notificationActions.addNotification({
      title: type === 'success' ? 'Success' : 'Error',
      message,
      type: type === 'success' ? 'success' : 'error',
      priority: 'medium',
      status: 'unread',
    });
  }, [notificationActions]);

  // Hook to get both description and comment fields
  const { data, error, isLoading } = useSWR(
    taskId ? `/api/tasks/${taskId}/comment-description` : null,
    taskId ? () => CommentService.getTaskCommentAndDescription(taskId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const updateTaskComment = useCallback(async (comment: string) => {
    if (!taskId) return;
    
    setIsUpdating(true);
    try {
      await CommentService.updateTaskComment({ taskId, comment });
      
      // Revalidate related cache
      mutate(`/api/tasks/${taskId}`, undefined, true);
      mutate(`/api/tasks/${taskId}/comment-description`, undefined, true);
      
      showNotification('Task note updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update task note', 'error');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [taskId, showNotification]);

  return {
    comment: data?.comment || '',
    description: data?.description || '',
    updateTaskComment,
    isLoading,
    isUpdating,
    error,
  };
}

// Hook for complete task data management (combines description and comment)
export function useTaskDetails(taskId: string | null) {
  const { updateDescription, isUpdating: isUpdatingDescription } = useTaskDescription(taskId);
  const { 
    comment, 
    description, 
    updateTaskComment, 
    isUpdating: isUpdatingComment,
    isLoading,
    error 
  } = useTaskCommentField(taskId);

  return {
    comment,
    description,
    updateDescription,
    updateTaskComment,
    isUpdatingDescription,
    isUpdatingComment,
    isLoading,
    error
  };
}
