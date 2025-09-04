/**
 * Post API Client - Handles all HTTP requests for posts
 */

import {
  CreatePostData,
  PostsResponse,
  SinglePostResponse,
  LikeResponse,
  CommentResponse,
  CommentsResponse,
  UploadUrlResponse,
  ApiPostsResponse,
  ApiPostResponse
} from '../../types/post';

export class PostApiClient {
  private baseURL = '/api';

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get presigned URL for image upload
   */
  async getImageUploadUrl(file: File): Promise<UploadUrlResponse> {
    const response = await fetch(`${this.baseURL}/posts/upload-url`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get upload URL error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Upload image directly to S3
   */
  async uploadImageToS3(file: File, uploadUrl: string, contentType: string): Promise<void> {
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

    if (postData.privacy) {
      formData.append('privacy', postData.privacy);
    }

    if (postData.linkedTaskId) {
      formData.append('linkedTaskId', postData.linkedTaskId.toString());
    }

    if (postData.linkedProjectId) {
      formData.append('linkedProjectId', postData.linkedProjectId.toString());
    }

    if (postData.image) {
      formData.append('image', postData.image);
    }

    if (postData.isPinned !== undefined) {
      formData.append('isPinned', postData.isPinned.toString());
    }

    const headers: Record<string, string> = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/posts`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create post error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get newsfeed posts
   */
  async getNewsfeed(page = 0, size = 10): Promise<ApiPostsResponse> {
    const response = await fetch(`${this.baseURL}/posts/feed?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get posts by user ID
   */
  async getUserPosts(userId: number, page = 0, size = 10): Promise<ApiPostsResponse> {
    const response = await fetch(`${this.baseURL}/posts/user/${userId}?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get single post details
   */
  async getPost(postId: number): Promise<ApiPostResponse> {
    const response = await fetch(`${this.baseURL}/posts/${postId}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Toggle like on a post
   */
  async toggleLike(postId: number): Promise<LikeResponse> {
    const response = await fetch(`${this.baseURL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Add comment to post
   */
  async addComment(postId: number, content: string): Promise<CommentResponse> {
    const response = await fetch(`${this.baseURL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: number, page = 0, size = 20): Promise<CommentsResponse> {
    const response = await fetch(`${this.baseURL}/posts/${postId}/comments?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}
