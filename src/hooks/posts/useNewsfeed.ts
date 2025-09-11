import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate, useSWRConfig } from 'swr';
import { PostData, PostsResponse, CreatePostData } from '@/types/post';
import PostsService from '@/services/post/PostsService';

// Pagination state interface
interface PaginationState {
  page: number;
  size: number;
  hasMore: boolean;
  totalElements: number;
  totalPages: number;
}

// Newsfeed hook return type
export interface UseNewsfeedReturn {
  posts: PostData[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: any;
  pagination: PaginationState;
  createPost: (postData: CreatePostData) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  updatePost: (updatedPost: PostData) => void;
}

// SWR fetcher function for newsfeed
const fetchNewsfeed = async (page: number, size: number): Promise<PostsResponse> => {
  return await PostsService.getNewsfeed(page, size);
};

export function useNewsfeed(initialSize = 10): UseNewsfeedReturn {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: initialSize,
    hasMore: true,
    totalElements: 0,
    totalPages: 0,
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allPosts, setAllPosts] = useState<PostData[]>([]);

  const { mutate: globalMutate } = useSWRConfig();

  // Generate proper URL-based SWR key
  const swrKey = useMemo(() =>
    `/api/posts/feed?page=${pagination.page}&size=${pagination.size}`,
    [pagination.page, pagination.size]
  );

  // Fetch current page data
  const { data, error, isLoading, mutate: mutatePage } = useSWR(
    swrKey,
    () => fetchNewsfeed(pagination.page, pagination.size),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      onSuccess: (data) => {
        if (data.success) {
          if (pagination.page === 0) {
            // First page - replace all posts
            setAllPosts(data.data);
          } else {
            // Additional pages - append to existing posts
            setAllPosts(prev => [...prev, ...data.data]);
          }

          setPagination(prev => ({
            ...prev,
            hasMore: data.pagination?.hasNext || false,
            totalElements: data.pagination?.totalElements || 0,
            totalPages: data.pagination?.totalPages || 0,
          }));
        }
      }
    }
  );

  // Create new post
  const createPost = useCallback(async (postData: CreatePostData) => {
    try {
      const response = await PostsService.createPost(postData);
      if (response.success && response.data) {
        // Add new post to the beginning of the list
        setAllPosts(prev => [response.data!, ...prev]);

        // Update pagination
        setPagination(prev => ({
          ...prev,
          totalElements: prev.totalElements + 1,
        }));

        // Invalidate the first page cache using proper URL-based key
        await globalMutate(`/api/posts/feed?page=0&size=${pagination.size}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }, [globalMutate, pagination.size]);

  // Load more posts (pagination)
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const response = await fetchNewsfeed(nextPage, pagination.size);

      if (response.success) {
        setAllPosts(prev => [...prev, ...response.data]);
        setPagination(prev => ({
          ...prev,
          page: nextPage,
          hasMore: response.pagination?.hasNext || false,
          totalElements: response.pagination?.totalElements || 0,
          totalPages: response.pagination?.totalPages || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pagination.hasMore, pagination.page, pagination.size, isLoadingMore]);

  // Refresh newsfeed (reset to first page)
  const refresh = useCallback(async () => {
    setPagination(prev => ({ ...prev, page: 0 }));
    setAllPosts([]);
    await mutatePage();
    // Invalidate all feed caches using proper URL-based pattern
    await globalMutate(key =>
      typeof key === 'string' && key.includes('/api/posts/feed')
    );
  }, [mutatePage, globalMutate]);

  // Toggle like on a post
  const toggleLike = useCallback(async (postId: number) => {
    // Find the post in current posts
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = allPosts[postIndex];

    // Optimistic update
    const updatedPost = {
      ...post,
      isLikedByCurrentUser: !post.isLikedByCurrentUser,
      likesCount: post.isLikedByCurrentUser
        ? post.likesCount - 1
        : post.likesCount + 1
    };

    // Update local state immediately
    setAllPosts(prev =>
      prev.map(p => p.id === postId ? updatedPost : p)
    );

    try {
      const response = await PostsService.toggleLike(postId);

      if (response.success && response.data) {
        // Update with real server data
        const realUpdatedPost = {
          ...post,
          isLikedByCurrentUser: response.data.isLikedByCurrentUser || false,
          likesCount: response.data.likesCount || post.likesCount
        };

        setAllPosts(prev =>
          prev.map(p => p.id === postId ? realUpdatedPost : p)
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setAllPosts(prev =>
        prev.map(p => p.id === postId ? post : p)
      );
    }
  }, [allPosts]);

  // Update a specific post (useful for external updates)
  const updatePost = useCallback((updatedPost: PostData) => {
    setAllPosts(prev =>
      prev.map(p => p.id === updatedPost.id ? updatedPost : p)
    );
  }, []);

  return {
    posts: allPosts,
    isLoading: isLoading && pagination.page === 0,
    isLoadingMore,
    error,
    pagination,
    createPost,
    loadMore,
    refresh,
    toggleLike,
    updatePost,
  };
}
