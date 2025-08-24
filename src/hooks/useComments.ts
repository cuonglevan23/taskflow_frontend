import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { CommentService } from '@/services/commentService';
import type { CommentListResponse, TaskComment } from '@/types/comment';
import { useNotifications } from '@/contexts/NotificationContext';

// Hook for fetching task comments
export function useTaskComments(taskId: number | null | string, page = 0, size = 10) {
  // Ensure taskId is a number
  const numericTaskId = taskId !== null && typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
  
  const { data, error, isLoading, mutate: revalidate } = useSWR<CommentListResponse>(
    numericTaskId ? `/api/task-comments/task/${numericTaskId}` : null,
    numericTaskId ? () => CommentService.getTaskComments(numericTaskId, page, size) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      errorRetryCount: 1, // Reduce retry count for better UX
      errorRetryInterval: 2000, // Shorter retry interval
      shouldRetryOnError: (err) => {
        // Don't retry on 404, 403, 500 errors
        const status = err?.response?.status;
        return !(status === 404 || status === 403 || status === 500);
      },
      onError: (error) => {
        // Silent error handling - logs removed per user request
      }
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
export function useCommentCount(taskId: string | number | null) {
  // Ensure taskId is a number
  const numericTaskId = taskId !== null && typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
  
  const { data, error, isLoading } = useSWR(
    numericTaskId ? `/api/task-comments/task/${numericTaskId}/count` : null,
    numericTaskId ? () => CommentService.getCommentCount(numericTaskId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      errorRetryCount: 1, // Reduce retry count
      errorRetryInterval: 2000, // Shorter retry interval
      shouldRetryOnError: (err) => {
        // Don't retry on 404, 403, 500 errors
        const status = err?.response?.status;
        return !(status === 404 || status === 403 || status === 500);
      },
      onError: (error) => {
        // Silent error handling - logs removed per user request
      }
    }
  );

  return {
    count: data?.commentCount || 0,
    isLoading,
    error
  };
}

// Hook for comment CRUD operations
export function useCommentActions(taskId: number | string | null) {
  // Ensure taskId is a number
  const numericTaskId = taskId !== null && typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
  
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
    if (!taskId || !content.trim()) return;
    
    setIsCreating(true);
    try {
      const numericTaskId = typeof taskId === 'string' ? parseInt(taskId) : taskId;
      if (isNaN(numericTaskId)) {
        throw new Error('Invalid task ID');
      }
      
      // Create optimistic comment for immediate UI update
      const optimisticComment: TaskComment = {
        id: Date.now(), // Temporary ID
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskId: numericTaskId,
        userId: 0,
        userEmail: 'current.user@example.com',
        userName: 'You',
        userAvatar: null,
        isEdited: false
      };
      
      // Optimistically update the cache
      const cacheKey = `/api/task-comments/task/${numericTaskId}`;
      mutate(cacheKey, (currentData: CommentListResponse | undefined) => {
        if (!currentData) return { comments: [optimisticComment], total: 1, page: 0, size: 10 };
        return {
          ...currentData,
          comments: [optimisticComment, ...currentData.comments],
          total: currentData.total + 1
        };
      }, false); // Don't revalidate immediately
      
      // Fix: Pass the data as an object with the correct interface
      const newComment = await CommentService.createComment({
        taskId: numericTaskId,
        content: content.trim()
      });
      
      // Force revalidation to get real data from server
      await mutate(cacheKey, undefined, { revalidate: true });
      await mutate(`/api/task-comments/task/${numericTaskId}/count`, undefined, { revalidate: true });
      
      showNotification('Comment created successfully', 'success');
      return newComment;
    } catch (error) {
      // Revert optimistic update on error
      const cacheKey = `/api/task-comments/task/${numericTaskId}`;
      await mutate(cacheKey, undefined, { revalidate: true });
      
      // Show specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [taskId, showNotification]);

  const updateComment = useCallback(async (commentId: number, content: string) => {
    if (!numericTaskId) return;
    
    setIsUpdating(true);
    try {
      const updatedComment = await CommentService.updateComment({ id: commentId, content });
      
      // Optimistically update the cache
      mutate(
        [`/api/task-comments/task/${numericTaskId}`, 0, 10],
        (data: CommentListResponse | undefined) => {
          if (!data) return data;
          return {
            ...data,
            comments: data.comments.map((comment: TaskComment) => 
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
  }, [numericTaskId, showNotification]);

  const deleteComment = useCallback(async (commentId: number) => {
    if (!numericTaskId) return;
    
    setIsDeleting(true);
    try {
      await CommentService.deleteComment(commentId);
      
      // Optimistically update the cache
      mutate(
        [`/api/task-comments/task/${numericTaskId}`, 0, 10],
        (data: CommentListResponse | undefined) => {
          if (!data) return data;
          return {
            ...data,
            comments: data.comments.filter((comment: TaskComment) => comment.id !== commentId),
            total: data.total - 1,
          };
        },
        false
      );
      
      // Update comment count cache
      mutate(
        `/api/task-comments/task/${numericTaskId}/count`,
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
  }, [numericTaskId, showNotification]);

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
