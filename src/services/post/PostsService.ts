/**
 * Posts Service - Main service class that combines API client and data transformation
 */

import {
  CreatePostData,
  UpdatePostData,
  PostsResponse,
  SinglePostResponse,
  LikeResponse,
  CommentResponse,
  CommentsResponse,
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
   * Create a new post with image upload
   */
  async createPost(postData: CreatePostData): Promise<SinglePostResponse> {
    // 🔍 DEBUG: Log the data received by PostsService
    console.log('📝 [PostsService] createPost called with:', {
      content: postData.content,
      hasImages: !!postData.images,
      imageCount: postData.images?.length || 0,
      hasImage: !!postData.image,
      privacy: postData.privacy,
      imageFiles: postData.images?.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type
      })) || []
    });

    const apiResponse = await this.apiClient.createPost(postData);

    // 🔍 DEBUG: Log the raw API response before transformation
    console.log('📡 [PostsService] Raw API response:', {
      id: apiResponse.id,
      content: apiResponse.content,
      imageUrl: apiResponse.imageUrl,
      imageUrls: apiResponse.imageUrls,
      hasImageUrls: !!apiResponse.imageUrls,
      imageUrlsLength: apiResponse.imageUrls?.length || 0
    });

    const transformedResponse = this.transformer.transformSinglePostResponse(apiResponse);

    // 🔍 DEBUG: Log the transformed response
    console.log('🔄 [PostsService] Transformed response:', {
      success: transformedResponse.success,
      postId: transformedResponse.data?.id,
      imageUrl: transformedResponse.data?.imageUrl,
      imageUrls: transformedResponse.data?.imageUrls,
      imageUrlsCount: transformedResponse.data?.imageUrls?.length || 0
    });

    // 🚨 Add specific warning for multiple image upload issues
    if (postData.images && postData.images.length > 0) {
      const expectedImageCount = postData.images.length;
      const receivedImageCount = transformedResponse.data?.imageUrls?.length || 0;

      if (receivedImageCount === 0) {
        console.error('❌ [PostsService] CRITICAL: Multiple image upload failed');
        console.error('❌ [PostsService] Sent', expectedImageCount, 'images but received 0 image URLs');
        console.error('❌ [PostsService] This indicates the backend is not processing multiple images correctly');

        // Add a warning message to the response but don't fail the post creation
        if (transformedResponse.data) {
          transformedResponse.message = `Post created but ${expectedImageCount} image(s) failed to upload. Please check backend configuration.`;
        }
      } else if (receivedImageCount !== expectedImageCount) {
        console.warn('⚠️ [PostsService] Partial image upload success');
        console.warn('⚠️ [PostsService] Expected:', expectedImageCount, 'Received:', receivedImageCount);

        if (transformedResponse.data) {
          transformedResponse.message = `Post created but only ${receivedImageCount} of ${expectedImageCount} images were uploaded successfully.`;
        }
      } else {
        console.log('✅ [PostsService] All images uploaded successfully');
      }
    }

    return transformedResponse;
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

  /**
   * Delete a post (if user has permission)
   */
  async deletePost(postId: number): Promise<{ success: boolean; message: string }> {
    return this.apiClient.deletePost(postId);
  }

  /**
   * Update a post (if user has permission)
   */
  async updatePost(postId: number, updateData: UpdatePostData): Promise<SinglePostResponse> {
    const apiResponse = await this.apiClient.updatePost(postId, updateData);
    return this.transformer.transformSinglePostResponse(apiResponse);
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
    const apiResponse = await this.apiClient.addComment(postId, request);
    return this.transformer.transformCommentResponse(apiResponse);
  }

  /**
   * Get comments for a post with pagination
   */
  async getComments(postId: number, page = 0, size = 20): Promise<CommentsResponse> {
    const apiResponse = await this.apiClient.getComments(postId, page, size);
    return this.transformer.transformCommentsResponse(apiResponse);
  }

  /**
   * Like or unlike a comment
   */
  async toggleCommentLike(commentId: number): Promise<CommentResponse> {
    const apiResponse = await this.apiClient.toggleCommentLike(commentId);
    return this.transformer.transformCommentResponse(apiResponse);
  }

  /**
   * Get replies for a specific comment
   */
  async getCommentReplies(commentId: number, page = 0, size = 10): Promise<CommentsResponse> {
    const apiResponse = await this.apiClient.getCommentReplies(commentId, page, size);
    return this.transformer.transformCommentsResponse(apiResponse);
  }

  /**
   * Edit a comment (if user has permission)
   */
  async editComment(commentId: number, content: string): Promise<CommentResponse> {
    const apiResponse = await this.apiClient.editComment(commentId, content);
    return this.transformer.transformCommentResponse(apiResponse);
  }

  /**
   * Delete a comment (if user has permission)
   */
  async deleteComment(commentId: number): Promise<{ success: boolean; message: string }> {
    return this.apiClient.deleteComment(commentId);
  }
}

export default new PostsService();
