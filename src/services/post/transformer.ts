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
  ApiPostsResponse,
  CommentResponse,
  CommentsResponse
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
    const transformedData = {
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
      imageUrls: apiPost.imageUrls || (apiPost.imageUrl ? [apiPost.imageUrl] : []), // Handle multiple images
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

    return transformedData;
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
    // Handle wrapped response format
    if ('data' in apiResponse && apiResponse.data) {
      return {
        success: apiResponse.success !== false,
        message: apiResponse.message || 'Success',
        data: this.transformPostData(apiResponse.data)
      };
    }

    // Handle direct post data format
    const postData = apiResponse as ApiPostResponse;

    // Ensure we have valid post data with required fields
    const safePostData: ApiPostResponse = {
      ...postData, // Spread existing data first
      id: postData?.id || 0, // Then override with safe defaults
      content: postData?.content || '',
      privacy: postData?.privacy || 'PUBLIC'
    };

    return {
      success: true,
      message: 'Success',
      data: this.transformPostData(safePostData)
    };
  }

  /**
   * Transform comment data from API format to frontend format
   */
  transformCommentData(apiComment: any): CommentData {
    const transformedComment = {
      id: this.safeNumber(apiComment.id),
      content: apiComment.content || '',
      user: {
        id: this.safeNumber(apiComment.user?.id || apiComment.userId || apiComment.authorId),
        firstName: apiComment.user?.firstName ||
                  apiComment.user?.name?.split(' ')[0] ||
                  apiComment.firstName ||
                  apiComment.author?.firstName ||
                  apiComment.authorName?.split(' ')[0] ||
                  'Unknown',
        lastName: apiComment.user?.lastName ||
                 apiComment.user?.name?.split(' ').slice(1).join(' ') ||
                 apiComment.lastName ||
                 apiComment.author?.lastName ||
                 apiComment.authorName?.split(' ').slice(1).join(' ') ||
                 'User',
        username: apiComment.user?.username ||
                 apiComment.username ||
                 apiComment.author?.username ||
                 apiComment.authorUsername ||
                 `user${apiComment.user?.id || apiComment.userId || apiComment.authorId || ''}`,
        avatarUrl: apiComment.user?.avatarUrl ||
                  apiComment.user?.avatar ||
                  apiComment.avatarUrl ||
                  apiComment.avatar ||
                  apiComment.author?.avatar ||
                  apiComment.author?.avatarUrl ||
                  apiComment.authorAvatar ||
                  null,
        premiumBadgeUrl: apiComment.user?.premiumBadgeUrl ||
                        apiComment.user?.premiumBadge ||
                        apiComment.premiumBadgeUrl ||
                        apiComment.author?.premiumBadge ||
                        null,
        isOnline: apiComment.user?.isOnline || apiComment.isOnline || false,
      },
      parentCommentId: apiComment.parentCommentId || null,
      likeCount: this.safeNumber(apiComment.likeCount || apiComment.likesCount || 0),
      isLikedByCurrentUser: apiComment.isLikedByCurrentUser || apiComment.hasLiked || false,
      createdAt: apiComment.createdAt || new Date().toISOString(),
      updatedAt: apiComment.updatedAt || apiComment.createdAt || new Date().toISOString(),
      replies: (apiComment.replies || []).map((reply: any) => this.transformCommentData(reply)),
      replyCount: this.safeNumber(apiComment.replyCount || apiComment.repliesCount || apiComment.replies?.length || 0),
      recentLikes: (apiComment.recentLikes || []).map((like: any) => ({
        userId: this.safeNumber(like.userId || like.id),
        username: like.username || like.name || `user${like.userId || like.id}`,
        firstName: like.firstName || like.name?.split(' ')[0] || 'Unknown',
        lastName: like.lastName || like.name?.split(' ').slice(1).join(' ') || 'User',
        avatarUrl: like.avatarUrl || like.avatar || null,
        likedAt: like.likedAt || like.createdAt || new Date().toISOString(),
      })),
      canEdit: apiComment.canEdit || false,
      canDelete: apiComment.canDelete || false,
    };

    return transformedComment;
  }

  /**
   * Transform comments response from API
   */
  transformCommentsResponse(apiResponse: any): CommentsResponse {
    return {
      success: apiResponse.success || true,
      message: apiResponse.message || 'Comments retrieved successfully',
      data: (apiResponse.data || apiResponse.content || []).map((comment: any) => this.transformCommentData(comment)),
      pagination: this.transformPaginationData(apiResponse.pagination || apiResponse),
    };
  }

  /**
   * Transform single comment response from API
   */
  transformCommentResponse(apiResponse: any): CommentResponse {
    return {
      success: apiResponse.success || true,
      message: apiResponse.message || 'Comment processed successfully',
      data: this.transformCommentData(apiResponse.data || apiResponse),
    };
  }
}
