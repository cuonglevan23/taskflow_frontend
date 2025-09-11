/**
 * Posts Service - Main service class that combines API client and data transformation
 */

import {
  CreatePostData,
  PostsResponse,
  SinglePostResponse,
  LikeResponse,
  CommentResponse,
  CommentsResponse,
  UploadUrlResponse,
  CreateCommentRequest
} from '../../types/post';
import { PostApiClient } from './apiClient';
import { PostDataTransformer } from './transformer';

class PostsService {
  private apiClient: PostApiClient;
  private transformer: PostDataTransformer;

  constructor() {
    this.apiClient = new PostApiClient();
    this.transformer = new PostDataTransformer();
  }

  /**
   * Get presigned URL for image upload
   */
  async getImageUploadUrl(file: File): Promise<UploadUrlResponse> {
    return this.apiClient.getImageUploadUrl(file);
  }

  /**
   * Upload image directly to S3
   */
  async uploadImageToS3(file: File, uploadUrl: string, contentType: string): Promise<void> {
    return this.apiClient.uploadImageToS3(file, uploadUrl, contentType);
  }

  /**
   * Create a new post with image upload
   */
  async createPost(postData: CreatePostData): Promise<SinglePostResponse> {
    const apiResponse = await this.apiClient.createPost(postData);
    return this.transformer.transformSinglePostResponse(apiResponse);
  }

  /**
   * Get newsfeed posts
   */
  async getNewsfeed(page = 0, size = 10): Promise<PostsResponse> {
    const apiResponse = await this.apiClient.getNewsfeed(page, size);
    return this.transformer.transformApiResponse(apiResponse);
  }

  /**
   * Get posts by user ID (for profile page)
   */
  async getUserPosts(userId: number, page = 0, size = 10): Promise<PostsResponse> {
    const apiResponse = await this.apiClient.getUserPosts(userId, page, size);
    return this.transformer.transformApiResponse(apiResponse);
  }

  /**
   * Get current user's posts (for own profile)
   */
  async getMyPosts(page = 0, size = 10): Promise<PostsResponse> {
    // For now, use newsfeed as fallback - this could be improved
    return this.getNewsfeed(page, size);
  }

  /**
   * Get single post details
   */
  async getPost(postId: number): Promise<SinglePostResponse> {
    const apiResponse = await this.apiClient.getPost(postId);
    return this.transformer.transformSinglePostResponse(apiResponse);
  }

  /**
   * Like or unlike a post
   */
  async toggleLike(postId: number): Promise<LikeResponse> {
    return this.apiClient.toggleLike(postId);
  }

  // ==================== ENHANCED COMMENTS SYSTEM ====================

  /**
   * Add comment to post (supports both top-level comments and replies)
   */
  async addComment(postId: number, content: string, parentCommentId?: number): Promise<CommentResponse> {
    const request: CreateCommentRequest = {
      content,
      parentCommentId: parentCommentId || null
    };
    return this.apiClient.addComment(postId, request);
  }

  /**
   * Get comments for a post with pagination
   */
  async getComments(postId: number, page = 0, size = 20): Promise<CommentsResponse> {
    return this.apiClient.getComments(postId, page, size);
  }

  /**
   * Like or unlike a comment
   */
  async toggleCommentLike(commentId: number): Promise<CommentResponse> {
    return this.apiClient.toggleCommentLike(commentId);
  }

  /**
   * Get replies for a specific comment
   */
  async getCommentReplies(commentId: number, page = 0, size = 10): Promise<CommentsResponse> {
    return this.apiClient.getCommentReplies(commentId, page, size);
  }

  /**
   * Edit a comment (if user has permission)
   */
  async editComment(commentId: number, content: string): Promise<CommentResponse> {
    return this.apiClient.editComment(commentId, content);
  }

  /**
   * Delete a comment (if user has permission)
   */
  async deleteComment(commentId: number): Promise<{ success: boolean; message: string }> {
    return this.apiClient.deleteComment(commentId);
  }
}

export default new PostsService();
