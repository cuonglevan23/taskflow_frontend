import { useState, useEffect, useCallback, useMemo } from 'react';
import { PostData, CommentData } from '@/types/post';
import { PostsService } from '@/services/post';
import { usePostActions } from '@/hooks/posts';
import { mutate } from 'swr';

interface UsePostModalProps {
  post: PostData;
  isOpen: boolean;
  initialImageIndex?: number;
}

interface UsePostModalReturn {
  // State
  comments: CommentData[];
  isLoadingComments: boolean;
  isSubmittingComment: boolean;
  currentPost: PostData;
  commentsCount: number;
  hasMoreComments: boolean;
  currentPage: number;
  currentImageIndex: number;
  showEditModal: boolean;

  // Images
  images: string[];
  hasImages: boolean;

  // Actions
  setCurrentImageIndex: (index: number) => void;
  setShowEditModal: (show: boolean) => void;
  handlePostUpdate: (updatedPost: PostData) => void;
  handlePostDelete: () => void;
  handleLike: () => Promise<void>;
  loadComments: (reset?: boolean) => Promise<void>;
  handleSubmitComment: (content: string) => Promise<void>;
  handleReply: (parentId: number, content: string) => Promise<void>;
  handleCommentUpdate: (commentId: number, updatedComment: CommentData) => void;
  handleCommentDelete: (commentId: number) => void;

  // Utilities
  formatTimestamp: (timestamp: string) => string;
}

export function usePostModal({
  post,
  isOpen,
  initialImageIndex = 0
}: UsePostModalProps): UsePostModalReturn {
  // State management
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [showEditModal, setShowEditModal] = useState(false);

  const { toggleLike } = usePostActions();

  // Update local post state when prop changes
  useEffect(() => {
    setCurrentPost(post);
    setCommentsCount(post.commentsCount);
  }, [post]);

  // Reset image index when initialImageIndex changes
  useEffect(() => {
    setCurrentImageIndex(initialImageIndex);
  }, [initialImageIndex]);

  // Get images array (support both single and multiple images)
  const images = useMemo(() => {
    if (post.imageUrls && post.imageUrls.length > 0) {
      return post.imageUrls;
    } else if (post.imageUrl) {
      return [post.imageUrl];
    }
    return [];
  }, [post.imageUrls, post.imageUrl]);

  const hasImages = images.length > 0;

  // Handle post update from edit modal
  const handlePostUpdate = useCallback((updatedPost: PostData) => {
    setCurrentPost(updatedPost);
    setShowEditModal(false);
  }, []);

  // Handle post deletion
  const handlePostDelete = useCallback(() => {
    // This will be handled by parent component (close modal)
  }, []);

  // Handle like action
  const handleLike = useCallback(async () => {
    await toggleLike(currentPost, (updatedPost) => {
      setCurrentPost(updatedPost);
    });
  }, [currentPost, toggleLike]);

  // Format post timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && post.id) {
      loadComments(true);
    }
  }, [isOpen, post.id]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setComments([]);
      setCurrentPage(0);
      setHasMoreComments(false);
    }
  }, [isOpen]);

  /**
   * Load comments with pagination support
   */
  const loadComments = useCallback(async (reset = false) => {
    try {
      setIsLoadingComments(true);
      const page = reset ? 0 : currentPage;
      const response = await PostsService.getComments(post.id, page, 20);

      if (response.success) {
        const newComments = response.data || [];
        setComments(prev => reset ? newComments : [...prev, ...newComments]);
        setHasMoreComments(response.pagination?.hasNext || false);
        if (!reset) {
          setCurrentPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, currentPage]);

  /**
   * Handle new comment submission
   */
  const handleSubmitComment = useCallback(async (content: string) => {
    try {
      setIsSubmittingComment(true);
      const response = await PostsService.addComment(post.id, content);

      if (response.success) {
        setComments(prev => [response.data, ...prev]);
        setCommentsCount(prev => prev + 1);

        // Update the post cache to reflect new comment count
        const updatedPost = {
          ...post,
          commentsCount: post.commentsCount + 1
        };

        // Update SWR cache with new post data to ensure PostCard updates
        await Promise.all([
          mutate(`/api/posts/${post.id}`, updatedPost, false),
          mutate(`post-cache-${post.id}`, updatedPost, false)
        ]);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [post]);

  /**
   * Handle reply to comment
   */
  const handleReply = useCallback(async (parentId: number, content: string) => {
    try {
      const response = await PostsService.addComment(post.id, content, parentId);

      if (response.success) {
        // Update the parent comment's replies - add null safety check
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [response.data, ...(comment.replies || [])],
              replyCount: comment.replyCount + 1
            };
          }
          return comment;
        }));
        setCommentsCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error; // Re-throw to handle in Comment component
    }
  }, [post.id]);

  /**
   * Handle comment update (for likes, edits)
   */
  const handleCommentUpdate = useCallback((commentId: number, updatedComment: CommentData) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return updatedComment;
      }
      // Check in replies - add null safety check
      if (comment.replies && comment.replies.some(reply => reply.id === commentId)) {
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === commentId ? updatedComment : reply
          )
        };
      }
      return comment;
    }));
  }, []);

  /**
   * Handle comment deletion
   */
  const handleCommentDelete = useCallback((commentId: number) => {
    setComments(prev => {
      // Remove top-level comment
      const filtered = prev.filter(comment => comment.id !== commentId);

      // Remove from replies and update counts - add null safety checks
      const updated = filtered.map(comment => ({
        ...comment,
        replies: (comment.replies || []).filter(reply => reply.id !== commentId),
        replyCount: (comment.replies || []).filter(reply => reply.id !== commentId).length
      }));

      return updated;
    });
    setCommentsCount(prev => prev - 1);
  }, []);

  return {
    // State
    comments,
    isLoadingComments,
    isSubmittingComment,
    currentPost,
    commentsCount,
    hasMoreComments,
    currentPage,
    currentImageIndex,
    showEditModal,

    // Images
    images,
    hasImages,

    // Actions
    setCurrentImageIndex,
    setShowEditModal,
    handlePostUpdate,
    handlePostDelete,
    handleLike,
    loadComments,
    handleSubmitComment,
    handleReply,
    handleCommentUpdate,
    handleCommentDelete,

    // Utilities
    formatTimestamp
  };
}
