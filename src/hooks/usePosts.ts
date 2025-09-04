import useSWR, { mutate, useSWRConfig } from 'swr';
import postsService, { PostData, CreatePostData } from '@/services/postsService';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Define proper types for paginated data
interface PaginatedPostData {
  data: PostData[];
  pagination: {
    hasNext: boolean;
    hasPrevious: boolean;
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
}

interface LikeApiResponse {
  success: boolean;
  message?: string;
  data?: {
    postId?: number;
    likesCount?: number;
    likeCount?: number;
    isLikedByCurrentUser?: boolean;
    likedAt?: string;
  };
}

// Hook để sync post data với SWR cache để đảm bảo UI update realtime
export function useSyncedPost(initialPost: PostData): PostData {
  const [syncedPost, setSyncedPost] = useState<PostData>(initialPost);

  // Subscribe to individual post cache without using the global fetcher
  const { data: cachedPost } = useSWR(
    ['posts', initialPost.id],
    null, // Don't fetch, just subscribe to cache
    {
      fallbackData: initialPost,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      // Override the global fetcher to prevent URL validation errors
      fetcher: null,
    }
  );

  // Update when individual post cache changes
  useEffect(() => {
    if (cachedPost && cachedPost.id === initialPost.id) {
      setSyncedPost(cachedPost);
    }
  }, [cachedPost, initialPost.id]);

  // Also update when initial post prop changes (for new posts)
  useEffect(() => {
    setSyncedPost(initialPost);
  }, [initialPost]);

  return syncedPost;
}

// Hook để fetch single post với SWR cache
export function usePost(postId: number) {
  const { data, error, isLoading } = useSWR(
    postId ? ['posts', postId] : null,
    () => postsService.getPost(postId).then(res => res.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    post: data,
    isLoading,
    error,
    mutate: () => mutate(['posts', postId]),
  };
}

// Hook để quản lý logic của post (timestamp, actions, etc.)
export function usePostCard(post: PostData) {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();

  // Format timestamp utility
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  // Action handlers với optimistic updates
  const handleLike = useCallback(async () => {
    // Create optimistic post data
    const optimisticPost = {
      ...post,
      isLikedByCurrentUser: !post.isLikedByCurrentUser,
      likesCount: post.isLikedByCurrentUser
        ? post.likesCount - 1
        : post.likesCount + 1
    };

    // Helper function to update posts in paginated data
    const updatePostInPages = (pages: PaginatedPostData[]): PaginatedPostData[] => {
      if (!pages || !Array.isArray(pages)) return pages;
      return pages.map(page => ({
        ...page,
        data: page.data?.map((p: PostData) => p.id === post.id ? optimisticPost : p) || []
      }));
    };

    // Helper function to update posts with real API data
    const updatePostWithRealData = (pages: PaginatedPostData[], updatedPost: PostData): PaginatedPostData[] => {
      if (!pages || !Array.isArray(pages)) return pages;
      return pages.map(page => ({
        ...page,
        data: page.data?.map((p: PostData) => p.id === post.id ? updatedPost : p) || []
      }));
    };

    try {
      // Apply optimistic updates to all relevant caches and trigger UI updates
      await Promise.all([
        // Update individual post cache with revalidation
        globalMutate(['posts', post.id], optimisticPost, false),

        // Update all feed caches with revalidation
        globalMutate(
          key => Array.isArray(key) && key[0] === 'posts' && key[1] === 'feed',
          updatePostInPages,
          false
        ),

        // Update all user posts caches with revalidation
        globalMutate(
          key => Array.isArray(key) && key[0] === 'posts' && key[1] === 'user',
          updatePostInPages,
          false
        )
      ]);

      // Call the API
      const result: LikeApiResponse = await postsService.toggleLike(post.id);

      // If API returns updated data, use it to update the cache with real data
      if (result.success && result.data) {
        // Try different possible response formats
        const realUpdatedPost: PostData = {
          ...post,
          isLikedByCurrentUser: result.data.isLikedByCurrentUser !== undefined
            ? result.data.isLikedByCurrentUser
            : !post.isLikedByCurrentUser,
          likesCount: result.data.likesCount !== undefined
            ? result.data.likesCount
            : result.data.likeCount !== undefined
            ? result.data.likeCount
            : optimisticPost.likesCount // fallback to optimistic if API doesn't return count
        };

        // Update caches with real API data and trigger re-renders
        await Promise.all([
          globalMutate(['posts', post.id], realUpdatedPost, false),
          globalMutate(
            key => Array.isArray(key) && key[0] === 'posts' && key[1] === 'feed',
            (pages: PaginatedPostData[]) => updatePostWithRealData(pages, realUpdatedPost),
            false
          ),
          globalMutate(
            key => Array.isArray(key) && key[0] === 'posts' && key[1] === 'user',
            (pages: PaginatedPostData[]) => updatePostWithRealData(pages, realUpdatedPost),
            false
          )
        ]);
      }

    } catch (error) {
      console.error('Error liking post:', error);

      // Revert optimistic update by restoring original post data
      const revertedPost = { ...post };
      const revertPostInPages = (pages: PaginatedPostData[]): PaginatedPostData[] => {
        if (!pages || !Array.isArray(pages)) return pages;
        return pages.map(page => ({
          ...page,
          data: page.data?.map((p: PostData) => p.id === post.id ? revertedPost : p) || []
        }));
      };

      await Promise.all([
        globalMutate(['posts', post.id], revertedPost, false),
        globalMutate(
          key => Array.isArray(key) && key[0] === 'posts' && key[1] === 'feed',
          revertPostInPages,
          false
        ),
        globalMutate(
          key => Array.isArray(key) && key[0] === 'posts' && key[1] === 'user',
          revertPostInPages,
          false
        )
      ]);
    }
  }, [post, globalMutate]);

  const handleComment = useCallback(() => {
    // Navigate to post detail page or open comment modal
    router.push(`/posts/${post.id}#comments`);
  }, [post.id, router]);

  const handleShare = useCallback(async () => {
    try {
      // TODO: Implement share functionality
      console.log('Sharing post:', post.id);
      // Could show share modal or copy link to clipboard
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.authorName}`,
          text: post.content,
          url: `${window.location.origin}/posts/${post.id}`
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
        // Show toast notification
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  }, [post.id, post.authorName, post.content]);

  const handleAuthorClick = useCallback(() => {
    router.push(`/profile/${post.authorUsername}`);
  }, [post.authorUsername, router]);

  // Generate descriptive alt text for images
  const getImageAlt = useCallback((): string => {
    const author = post.authorName;
    const contentPreview = post.content.slice(0, 50);
    return `Image shared by ${author}: ${contentPreview}${contentPreview.length >= 50 ? '...' : ''}`;
  }, [post.authorName, post.content]);

  return {
    formatTimestamp: formatTimestamp(post.createdAt),
    handleLike,
    handleComment,
    handleShare,
    handleAuthorClick,
    getImageAlt,
  };
}

// Hook để fetch user posts đơn giản với useSWR
export function useUserPosts(userId: number) {
  const { data, error, isLoading, mutate } = useSWR(
    userId > 0 ? ['posts', 'user', userId] : null,
    () => postsService.getUserPosts(userId, 0, 20),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  const posts = data?.data || [];

  return {
    posts,
    error,
    isLoading,
    mutate,
    isEmpty: posts.length === 0,
    isReachingEnd: true, // Đơn giản hóa, không pagination
  };
}

// Hook để fetch newsfeed với pagination
export function useNewsfeed() {
  const getKey = (pageIndex: number, previousPageData: PaginatedPostData | null) => {
    if (previousPageData && !previousPageData.pagination.hasNext) return null;
    return ['posts', 'feed', pageIndex];
  };

  const { data, error, size, setSize, isLoading } = useSWRInfinite(
    getKey,
    ([, , page]) => postsService.getNewsfeed(page, 10),
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const posts = data ? data.flatMap(page => page.data) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.pagination?.hasNext);

  return {
    posts,
    error,
    isLoading,
    isLoadingMore,
    size,
    setSize,
    isEmpty,
    isReachingEnd,
  };
}

// Hook để create post với cache invalidation đơn giản
export function useCreatePost() {
  const { mutate } = useSWRConfig();

  const createPost = useCallback(async (postData: unknown) => {
    try {
      const response = await postsService.createPost(postData as CreatePostData);

      if (response.success) {
        // Đơn giản: chỉ invalidate cache posts
        mutate(
          key => Array.isArray(key) && key[0] === 'posts'
        );

        return response.data;
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }, [mutate]);

  return { createPost };
}
