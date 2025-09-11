import React, { createContext, useContext, ReactNode } from 'react';
import { PostData, CreatePostData } from '@/types/post';
import { useGlobalData } from './GlobalDataContext';

// Context value type - now using GlobalDataContext
interface NewsfeedContextValue {
  posts: PostData[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: any;
  pagination: {
    page: number;
    size: number;
    hasMore: boolean;
    totalElements: number;
    totalPages: number;
  };
  createPost: (postData: CreatePostData) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  updatePost: (updatedPost: PostData) => void;
}

// Create context
const NewsfeedContext = createContext<NewsfeedContextValue | null>(null);

// Provider props
interface NewsfeedProviderProps {
  children: ReactNode;
  pageSize?: number;
}

// Provider component - now uses GlobalDataContext
export function NewsfeedProvider({ children, pageSize = 10 }: NewsfeedProviderProps) {
  const globalData = useGlobalData();

  // Use posts from global context
  const posts = globalData.posts || [];
  const isLoading = globalData.isLoading;

  // Simple pagination state
  const [pagination] = React.useState({
    page: 0,
    size: pageSize,
    hasMore: posts.length >= pageSize,
    totalElements: posts.length,
    totalPages: Math.ceil(posts.length / pageSize),
  });

  const createPost = async (postData: CreatePostData) => {
    try {
      // Use global context method
      const newPost = await globalData.addPost(postData);
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const loadMore = async () => {
    // For now, just refresh all data
    await globalData.refetchAll();
  };

  const refresh = async () => {
    await globalData.refetchAll();
  };

  const toggleLike = async (postId: number) => {
    // This will be handled by individual PostCard components
    // but we can also trigger global cache invalidation
    globalData.invalidatePostsCache();
  };

  const updatePost = (updatedPost: PostData) => {
    globalData.updatePost(updatedPost.id, updatedPost);
  };

  const value: NewsfeedContextValue = {
    posts,
    isLoading,
    isLoadingMore: false, // Simplified for now
    error: globalData.error,
    pagination,
    createPost,
    loadMore,
    refresh,
    toggleLike,
    updatePost,
  };

  return (
    <NewsfeedContext.Provider value={value}>
      {children}
    </NewsfeedContext.Provider>
  );
}

// Hook to use the context
export function useNewsfeedContext(): NewsfeedContextValue {
  const context = useContext(NewsfeedContext);

  if (!context) {
    throw new Error('useNewsfeedContext must be used within a NewsfeedProvider');
  }

  return context;
}

// Export context for advanced usage
export { NewsfeedContext };
