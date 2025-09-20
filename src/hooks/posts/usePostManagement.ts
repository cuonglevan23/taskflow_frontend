import { useState, useCallback } from 'react';
import { PostData, UpdatePostData } from '@/types/post';
import PostsService from '@/services/post/PostsService';
import { useAuth } from '@/components/auth/AuthProvider';
import { mutate } from 'swr';

// Hook for managing post CRUD operations with permissions
export function usePostManagement() {
  const [loadingStates, setLoadingStates] = useState<Record<number, 'editing' | 'deleting' | null>>({});
  const { user } = useAuth();

  // Check if user can edit a post (only author)
  const canEditPost = useCallback((post: PostData): boolean => {
    if (!user) return false;
    return post.authorId === Number(user.id);
  }, [user]);

  // Check if user can delete a post (author or admin)
  const canDeletePost = useCallback((post: PostData): boolean => {
    if (!user) return false;
    return post.authorId === Number(user.id) || user.role === 'ADMIN';
  }, [user]);

  // Update a post
  const updatePost = useCallback(async (
    postId: number,
    updateData: UpdatePostData,
    onSuccess?: (updatedPost: PostData) => void,
    onError?: (error: any) => void
  ) => {
    setLoadingStates(prev => ({ ...prev, [postId]: 'editing' }));

    try {
      const response = await PostsService.updatePost(postId, updateData);

      if (response.success && response.data) {
        // Mutate SWR cache to update the post everywhere
        mutate(
          key => typeof key === 'string' && (key.includes('/posts') || key.includes('/feed')),
          undefined,
          { revalidate: true }
        );

        onSuccess?.(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      onError?.(error);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [postId]: null }));
    }
  }, []);

  // Delete a post
  const deletePost = useCallback(async (
    postId: number,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    setLoadingStates(prev => ({ ...prev, [postId]: 'deleting' }));

    try {
      const response = await PostsService.deletePost(postId);

      if (response.success) {
        // Mutate SWR cache to remove the post everywhere
        mutate(
          key => typeof key === 'string' && (key.includes('/posts') || key.includes('/feed')),
          undefined,
          { revalidate: true }
        );

        onSuccess?.();
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      onError?.(error);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [postId]: null }));
    }
  }, []);

  // Get loading state for a specific post
  const getLoadingState = useCallback((postId: number) => {
    return loadingStates[postId] || null;
  }, [loadingStates]);

  // Check if post is being edited
  const isEditing = useCallback((postId: number) => {
    return loadingStates[postId] === 'editing';
  }, [loadingStates]);

  // Check if post is being deleted
  const isDeleting = useCallback((postId: number) => {
    return loadingStates[postId] === 'deleting';
  }, [loadingStates]);

  return {
    // Permission checks
    canEditPost,
    canDeletePost,

    // Actions
    updatePost,
    deletePost,

    // Loading states
    getLoadingState,
    isEditing,
    isDeleting,
  };
}
