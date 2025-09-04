/**
 * Post-related TypeScript interfaces and types
 */

// Core Post Data Interface
export interface PostData {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorUsername: string;
  authorAvatar: string | null;
  authorPremiumBadge?: string | null;
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  imageUrl?: string | null;
  linkedTask?: {
    id: number;
    title: string;
    status: string;
    priority?: string;
  } | null;
  linkedProject?: {
    id: number;
    title: string;
    status: string;
  } | null;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
  comments?: CommentData[];
  createdAt: string;
  updatedAt: string;
}

// Comment Data Interface
export interface CommentData {
  id: number;
  content: string;
  postId: number;
  authorId: number;
  authorName: string;
  authorUsername: string;
  authorAvatar: string | null;
  authorPremiumBadge?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Create Post Data Interface
export interface CreatePostData {
  content: string;
  privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  linkedTaskId?: number;
  linkedProjectId?: number;
  image?: File;
  isPinned?: boolean;
}

// Upload URL Response Interface
export interface UploadUrlResponse {
  success: boolean;
  message: string;
  data: {
    uploadUrl: string;
    contentType: string;
    fileKey: string;
    imageUrl?: string;
  };
}

// Pagination Data Interface
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// API Response Interfaces
export interface PostsResponse {
  success: boolean;
  message: string;
  data: PostData[];
  pagination: PaginationData;
}

export interface SinglePostResponse {
  success: boolean;
  message: string;
  data: PostData;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    postId: number;
    likesCount: number;
    isLikedByCurrentUser: boolean;
    likedAt?: string;
  };
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: CommentData;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: CommentData[];
  pagination: PaginationData;
}

// API Response Interfaces (for transformation)
export interface ApiPostResponse {
  id: number;
  content: string;
  privacy: string;
  imageUrl?: string | null;
  author?: {
    id: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
    avatarUrl?: string;
    premiumBadge?: string;
  };
  authorId?: number;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string | null;
  authorPremiumBadge?: string | null;
  linkedTask?: {
    id: number;
    title: string;
    status: string;
    priority?: string;
  } | null;
  linkedProject?: {
    id: number;
    title: string;
    status: string;
  } | null;
  likeCount?: number;
  likesCount?: number;
  likes?: number;
  commentCount?: number;
  commentsCount?: number;
  comments?: unknown[];
  topComments?: unknown[];
  isPinned?: boolean;
  isLikedByCurrentUser?: boolean;
  hasLiked?: boolean;
  liked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string;
  attachments?: unknown;
  recentLikes?: unknown[];
}

export interface ApiPostsResponse {
  success?: boolean;
  message?: string;
  data?: ApiPostResponse[];
  content?: ApiPostResponse[];
  pagination?: {
    currentPage?: number;
    totalPages?: number;
    totalElements?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
  page?: number;
  totalPages?: number;
  totalElements?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Privacy type
export type PostPrivacy = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

// Task Status and Priority types for linked items
export type TaskStatus = string;
export type TaskPriority = string;
export type ProjectStatus = string;
