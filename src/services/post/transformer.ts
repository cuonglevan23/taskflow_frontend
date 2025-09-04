/**
 * Post Data Transformer - Handles data transformation between API and frontend formats
 */

import {
  PostData,
  CommentData,
  PostsResponse,
  SinglePostResponse,
  PaginationData,
  ApiPostResponse,
  ApiPostsResponse
} from '../../types/post';

export class PostDataTransformer {
  /**
   * Helper function to safely convert to number
   */
  private safeNumber(value: unknown): number {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Transform API post response to frontend PostData format
   */
  transformPostData(apiPost: ApiPostResponse): PostData {
    return {
      id: this.safeNumber(apiPost.id),
      content: apiPost.content || '',
      authorId: this.safeNumber(apiPost.authorId || apiPost.author?.id),
      authorName: apiPost.authorName ||
                 (apiPost.author ? `${apiPost.author.firstName || ''} ${apiPost.author.lastName || ''}`.trim() : '') ||
                 'Unknown User',
      authorUsername: apiPost.authorUsername || apiPost.author?.username || '',
      authorAvatar: apiPost.authorAvatar || apiPost.author?.avatar || apiPost.author?.avatarUrl || null,
      authorPremiumBadge: apiPost.authorPremiumBadge || apiPost.author?.premiumBadge || null,
      privacy: (apiPost.privacy as 'PUBLIC' | 'FRIENDS' | 'PRIVATE') || 'PUBLIC',
      imageUrl: apiPost.imageUrl || null,
      linkedTask: apiPost.linkedTask || null,
      linkedProject: apiPost.linkedProject || null,
      isPinned: Boolean(apiPost.isPinned),

      // Handle different field name variations from backend
      likesCount: this.safeNumber(apiPost.likesCount || apiPost.likeCount || 0),
      commentsCount: this.safeNumber(apiPost.commentsCount || apiPost.commentCount || 0),
      isLikedByCurrentUser: Boolean(apiPost.isLikedByCurrentUser || apiPost.hasLiked || apiPost.liked),

      comments: (apiPost.comments as CommentData[]) || (apiPost.topComments as CommentData[]) || [],
      createdAt: apiPost.createdAt || apiPost.timestamp || new Date().toISOString(),
      updatedAt: apiPost.updatedAt || apiPost.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Transform pagination data
   */
  private transformPaginationData(apiResponse: ApiPostsResponse): PaginationData {
    return {
      currentPage: apiResponse.pagination?.currentPage || apiResponse.page || 0,
      totalPages: apiResponse.pagination?.totalPages || apiResponse.totalPages || 1,
      totalElements: apiResponse.pagination?.totalElements || apiResponse.totalElements || 0,
      hasNext: apiResponse.pagination?.hasNext !== false && (apiResponse.hasNext !== false),
      hasPrevious: apiResponse.pagination?.hasPrevious || apiResponse.hasPrevious || false,
    };
  }

  /**
   * Transform API response to frontend PostsResponse format
   */
  transformApiResponse(apiResponse: ApiPostsResponse): PostsResponse {
    const postsArray = Array.isArray(apiResponse.data)
      ? apiResponse.data
      : Array.isArray(apiResponse.content)
      ? apiResponse.content
      : Array.isArray(apiResponse)
      ? (apiResponse as unknown as ApiPostResponse[])
      : [];

    return {
      success: apiResponse.success !== false,
      message: apiResponse.message || 'Success',
      data: postsArray.map(post => this.transformPostData(post)),
      pagination: this.transformPaginationData(apiResponse)
    };
  }

  /**
   * Transform single post API response
   */
  transformSinglePostResponse(
    apiResponse: { success?: boolean; message?: string; data?: ApiPostResponse } | ApiPostResponse
  ): SinglePostResponse {
    const postData = 'data' in apiResponse ? apiResponse.data : apiResponse;

    // Ensure we have valid post data with required fields
    const safePostData: ApiPostResponse = {
      id: postData?.id || 0,
      content: postData?.content || '',
      privacy: postData?.privacy || 'PUBLIC',
      ...postData
    };

    return {
      success: ('success' in apiResponse ? apiResponse.success : true) !== false,
      message: ('message' in apiResponse ? apiResponse.message : '') || 'Success',
      data: this.transformPostData(safePostData)
    };
  }
}
