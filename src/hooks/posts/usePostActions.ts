import { useState, useCallback } from 'react';
import { PostData } from '@/types/post';
import PostsService from '@/services/post/PostsService';

// Hook for managing individual post interactions
export function usePostActions() {
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  // Toggle like with loading state
  const toggleLike = useCallback(async (post: PostData, onUpdate?: (updatedPost: PostData) => void) => {
    const postId = post.id;

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [postId]: true }));

    // Optimistic update
    const optimisticPost = {
      ...post,
      isLikedByCurrentUser: !post.isLikedByCurrentUser,
      likesCount: post.isLikedByCurrentUser
        ? post.likesCount - 1
        : post.likesCount + 1
    };

    // Call onUpdate with optimistic data immediately
    onUpdate?.(optimisticPost);

    try {
      const response = await PostsService.toggleLike(postId);

      if (response.success && response.data) {
        // Update with real server data
        const realUpdatedPost = {
          ...post,
          isLikedByCurrentUser: response.data.isLikedByCurrentUser || false,
          likesCount: response.data.likesCount || post.likesCount
        };

        onUpdate?.(realUpdatedPost);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      onUpdate?.(post);
      throw error;
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [postId]: false }));
    }
  }, []);

  // Add comment with loading state
  const addComment = useCallback(async (postId: number, content: string, parentCommentId?: number) => {
    try {
      const response = await PostsService.addComment(postId, content, parentCommentId);
      return response;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, []);

  // Get loading state for a specific post
  const getLoadingState = useCallback((postId: number) => {
    return loadingStates[postId] || false;
  }, [loadingStates]);

  return {
    toggleLike,
    addComment,
    getLoadingState,
  };
}
