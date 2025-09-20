/**
 * Post API Client - Handles all HTTP requests for posts
 */

import {
  CreatePostData,
  UpdatePostData,
  LikeResponse,
  CommentResponse,
  CommentsResponse,
  UploadUrlResponse,
  ApiPostsResponse,
  ApiPostResponse,
  CreateCommentRequest
} from '../../types/post';
import { BaseApiClient } from '../../lib/baseApiClient';

export class PostApiClient {
  /**
   * Get presigned URL for image upload
   */
  async getImageUploadUrl(file: File): Promise<UploadUrlResponse> {
    return BaseApiClient.post<UploadUrlResponse>('/api/posts/upload-url', {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    });
  }

  /**
   * Upload image directly to S3
   */
  async uploadImageToS3(file: File, uploadUrl: string, contentType: string): Promise<void> {
    // S3 upload requires direct fetch, not through our API client
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!response.ok) {
      console.error('S3 upload error:', response.status, response.statusText);
      throw new Error(`S3 upload failed: ${response.status}`);
    }
  }

  /**
   * Create a new post
   */
  async createPost(postData: CreatePostData): Promise<ApiPostResponse> {
    const formData = new FormData();
    formData.append('content', postData.content);

    // 🔍 DEBUG: Log FormData preparation
    console.log('📦 [ApiClient] Preparing FormData with:', {
      content: postData.content,
      hasImages: !!postData.images,
      imageCount: postData.images?.length || 0,
      hasImage: !!postData.image,
      imageFiles: postData.images?.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type
      })) || []
    });

    if (postData.privacy) {
      formData.append('privacy', postData.privacy);
      console.log('📦 [ApiClient] Added privacy:', postData.privacy);
    }

    if (postData.linkedTaskId) {
      formData.append('linkedTaskId', postData.linkedTaskId.toString());
    }

    if (postData.linkedProjectId) {
      formData.append('linkedProjectId', postData.linkedProjectId.toString());
    }

    // Handle multiple images (new backend support)
    if (postData.images && postData.images.length > 0) {
      console.log('📦 [ApiClient] Adding multiple images to FormData:', postData.images.length);
      postData.images.forEach((image, index) => {
        formData.append('images', image);
        console.log(`📦 [ApiClient] Added image ${index + 1}:`, {
          name: image.name,
          size: image.size,
          type: image.type
        });
      });
    }
    // Handle single image for backward compatibility
    else if (postData.image) {
      console.log('📦 [ApiClient] Adding single image to FormData (backward compatibility)');
      formData.append('images', postData.image);
    }

    // Handle file attachments (new backend support)
    if (postData.files && postData.files.length > 0) {
      console.log('📦 [ApiClient] Adding files to FormData:', postData.files.length);
      postData.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    if (postData.isPinned !== undefined) {
      formData.append('isPinned', postData.isPinned.toString());
    }

    // 🔍 DEBUG: Log FormData contents
    console.log('📦 [ApiClient] Final FormData entries:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    console.log('🌐 [ApiClient] Sending POST request via BaseApiClient');

    const response = await BaseApiClient.uploadFile<ApiPostResponse>('/api/posts', formData);

    // 🔍 DEBUG: Log the final response
    console.log('📥 [ApiClient] Response:', {
      id: response.id,
      content: response.content,
      imageUrl: response.imageUrl,
      imageUrls: response.imageUrls,
      hasImageUrls: !!response.imageUrls,
      imageUrlsLength: response.imageUrls?.length || 0
    });

    // 🚨 Add validation for multiple image response
    if (postData.images && postData.images.length > 0) {
      const expectedImageCount = postData.images.length;
      const receivedImageCount = response.imageUrls?.length || 0;

      if (receivedImageCount === 0) {
        console.error('❌ [ApiClient] Backend did not return any image URLs despite sending', expectedImageCount, 'images');
        console.error('❌ [ApiClient] This indicates a backend processing issue');
      } else if (receivedImageCount !== expectedImageCount) {
        console.warn('⚠️ [ApiClient] Image count mismatch - sent:', expectedImageCount, 'received:', receivedImageCount);
      } else {
        console.log('✅ [ApiClient] All images processed successfully');
      }
    }

    return response;
  }

  /**
   * Get newsfeed posts
   */
  async getNewsfeed(page = 0, size = 10): Promise<ApiPostsResponse> {
    return BaseApiClient.get<ApiPostsResponse>(`/api/posts/feed`, { page, size });
  }

  /**
   * Get posts by user ID
   */
  async getUserPosts(userId: number, page = 0, size = 10): Promise<ApiPostsResponse> {
    return BaseApiClient.get<ApiPostsResponse>(`/api/posts/user/${userId}`, { page, size });
  }

  /**
   * Get single post details
   */
  async getPost(postId: number): Promise<ApiPostResponse> {
    return BaseApiClient.get<ApiPostResponse>(`/api/posts/${postId}`);
  }

  /**
   * Toggle like on a post
   */
  async toggleLike(postId: number): Promise<LikeResponse> {
    return BaseApiClient.post<LikeResponse>(`/api/posts/${postId}/like`);
  }

  /**
   * Delete a post
   */
  async deletePost(postId: number): Promise<{ success: boolean; message: string }> {
    return BaseApiClient.delete<{ success: boolean; message: string }>(`/api/posts/${postId}`);
  }

  /**
   * Update a post
   */
  async updatePost(postId: number, updateData: UpdatePostData): Promise<ApiPostResponse> {
    const formData = new FormData();

    // Add optional content
    if (updateData.content !== undefined) {
      formData.append('content', updateData.content);
    }

    // Add optional privacy
    if (updateData.privacy) {
      formData.append('privacy', updateData.privacy);
    }

    // Add optional linked task/project IDs
    if (updateData.linkedTaskId !== undefined) {
      formData.append('linkedTaskId', updateData.linkedTaskId.toString());
    }

    if (updateData.linkedProjectId !== undefined) {
      formData.append('linkedProjectId', updateData.linkedProjectId.toString());
    }

    // Handle multiple images update
    if (updateData.images && updateData.images.length > 0) {
      updateData.images.forEach((image) => {
        formData.append('images', image);
      });
    }
    // Handle single image update for backward compatibility
    else if (updateData.image) {
      formData.append('image', updateData.image);
    }

    // Handle file attachments update
    if (updateData.files && updateData.files.length > 0) {
      updateData.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    // Add optional pinned status
    if (updateData.isPinned !== undefined) {
      formData.append('isPinned', updateData.isPinned.toString());
    }

    // Handle image removal
    if (updateData.removeImageIds && updateData.removeImageIds.length > 0) {
      updateData.removeImageIds.forEach((imageId) => {
        formData.append('removeImageIds', imageId.toString());
      });
    }

    // Handle file removal
    if (updateData.removeFileIds && updateData.removeFileIds.length > 0) {
      updateData.removeFileIds.forEach((fileId) => {
        formData.append('removeFileIds', fileId.toString());
      });
    }

    return BaseApiClient.put<ApiPostResponse>(`/api/posts/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Add comment to post (supports nested replies)
   */
  async addComment(postId: number, request: CreateCommentRequest): Promise<CommentResponse> {
    return BaseApiClient.post<CommentResponse>(`/api/posts/${postId}/comment`, request);
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: number, page = 0, size = 20): Promise<CommentsResponse> {
    return BaseApiClient.get<CommentsResponse>(`/api/posts/${postId}/comments`, { page, size });
  }

  /**
   * Toggle like on a comment
   */
  async toggleCommentLike(commentId: number): Promise<CommentResponse> {
    return BaseApiClient.post<CommentResponse>(`/api/posts/comments/${commentId}/like`);
  }

  /**
   * Get replies for a specific comment
   */
  async getCommentReplies(commentId: number, page = 0, size = 10): Promise<CommentsResponse> {
    return BaseApiClient.get<CommentsResponse>(`/api/posts/comments/${commentId}/replies`, { page, size });
  }

  /**
   * Edit a comment
   */
  async editComment(commentId: number, content: string): Promise<CommentResponse> {
    return BaseApiClient.put<CommentResponse>(`/api/posts/comments/${commentId}`, { content });
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<{ success: boolean; message: string }> {
    return BaseApiClient.delete<{ success: boolean; message: string }>(`/api/posts/comments/${commentId}`);
  }
}
