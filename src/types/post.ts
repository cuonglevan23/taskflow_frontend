/**
 * Post-related TypeScript interfaces and types
 */

// User Data Interface for Comments
export interface CommentUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  premiumBadgeUrl: string | null;
  isOnline: boolean;
}

// Recent Like Interface
export interface RecentLike {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  likedAt: string;
}

// Enhanced Comment Data Interface
export interface CommentData {
  id: number;
  content: string;
  user: CommentUser;
  parentCommentId: number | null;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentData[];
  replyCount: number;
  recentLikes: RecentLike[];
  canEdit: boolean;
  canDelete: boolean;
}

// Create Comment Request
export interface CreateCommentRequest {
  content: string;
  parentCommentId?: number | null;
}

// Comments Response Interface
export interface CommentsResponse {
  success: boolean;
  message: string;
  data: CommentData[];
  pagination: PaginationData;
}

// Single Comment Response Interface
export interface SingleCommentResponse {
  success: boolean;
  message: string;
  data: CommentData;
}

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
  imageUrl?: string | null; // Keep for backward compatibility
  imageUrls?: string[]; // New: Support multiple images
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

// Create Post Data Interface
export interface CreatePostData {
  content: string;
  privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  linkedTaskId?: number;
  linkedProjectId?: number;
  image?: File; // Keep for backward compatibility
  images?: File[]; // New: Support multiple images
  files?: File[]; // New: Support file attachments
  isPinned?: boolean;
}

// Update Post Data Interface
export interface UpdatePostData {
  content?: string;
  privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  linkedTaskId?: number;
  linkedProjectId?: number;
  image?: File; // Single image update
  images?: File[]; // Multiple images update
  files?: File[]; // File attachments update
  isPinned?: boolean;
  removeImageIds?: number[]; // IDs of images to remove
  removeFileIds?: number[]; // IDs of files to remove
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
  imageUrls?: string[]; // New: Support multiple images from backend
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
