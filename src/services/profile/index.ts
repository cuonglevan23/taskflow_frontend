import { ProfileData, FriendshipStatus, FriendAction } from '@/types/profile';
import { BaseApiClient } from '@/lib/baseApiClient';

// Define the online status interface to match the backend response
export interface OnlineStatus {
  status: 'online' | 'away' | 'offline';
  lastSeen: string | null;
  isOnline: boolean;
}

// Profile API Service using BaseApiClient
export class ProfileService {
  // Cache for online statuses to prevent excessive API calls
  private static onlineStatusCache: Map<number, { status: OnlineStatus, timestamp: number }> = new Map();
  private static readonly CACHE_TIMEOUT = 60000; // 1 minute cache timeout

  // Add friendship status cache to prevent excessive API calls
  private static friendshipStatusCache: Map<number, { status: FriendshipStatus, timestamp: number }> = new Map();
  private static readonly FRIENDSHIP_CACHE_TIMEOUT = 30000; // 30 seconds cache timeout

  // Load profile data
  static async loadProfileData(userId?: string, isOwnProfile?: boolean): Promise<ProfileData> {
    let profileData: any;

    if (isOwnProfile) {
      // Chỉ sử dụng endpoint /api/user-profiles/me - endpoint duy nhất có trong backend
      try {
        profileData = await BaseApiClient.get<any>('/api/user-profiles/me');
      } catch (error) {
        console.error('❌ Failed to load own profile:', error);
        throw error;
      }
    } else {
      // Load other user's profile
      profileData = await BaseApiClient.get<any>(`/api/user-profiles/${userId}`);
    }

    // ✅ SỬA: Xử lý response với logic mapping trạng thái "away" đúng
    const processedData: ProfileData = {
      // Map basic fields từ response
      id: profileData.userId || profileData.id || 0,
      email: profileData.email || "",
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      username: profileData.username || "user",
      // Map avatar field đúng tên từ backend
      avatarUrl: profileData.avatar || profileData.avatarUrl || null,
      coverImageUrl: profileData.coverImageUrl || null,

      // Map từ nested profile object nếu có
      department: profileData.profile?.department || profileData.department || "Unknown Department",
      jobTitle: profileData.profile?.jobTitle || profileData.jobTitle || "Team Member",
      aboutMe: profileData.profile?.aboutMe || profileData.aboutMe || "No bio available",
      joinedAt: profileData.profile?.joinedAt || profileData.joinedAt || new Date().toISOString(),
      isPremium: profileData.profile?.isPremium || profileData.isPremium || false,
      premiumExpiry: profileData.profile?.premiumExpiry || profileData.premiumExpiry,
      premiumBadgeUrl: profileData.profile?.premiumBadgeUrl || profileData.premiumBadgeUrl,

      // Map friendship và other data
      friendshipStatus: profileData.friendshipStatus || profileData.profile?.friendshipStatus,
      isOwnProfile: isOwnProfile ?? false,

      // ✅ SỬA: Map online status với logic ưu tiên và đảm bảo không undefined
      isOnline: (() => {
        // Ưu tiên field isOnline nếu có giá trị boolean rõ ràng
        if (typeof profileData.isOnline === 'boolean') {
          return profileData.isOnline;
        }
        // Fallback dựa trên onlineStatus
        if (profileData.onlineStatus) {
          return profileData.onlineStatus === 'online' || profileData.onlineStatus === 'away';
        }
        // Default false nếu không có thông tin
        return false;
      })(),
      onlineStatus: profileData.onlineStatus || 'offline',
      lastSeen: profileData.lastSeen || null,

      // Map counts và stats
      tabCounts: profileData.tabCounts || profileData.profile?.tabCounts || {
        postsCount: 0,
        friendsCount: 0,
        tasksCount: 0,
        publicTasksCount: 0,
        sharedTasksCount: 0
      },
      stats: profileData.stats || profileData.profile?.stats || {
        totalPosts: 0,
        totalFriends: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        mutualFriendsCount: 0,
        taskCompletionRate: 0,
        isOwnProfile: isOwnProfile ?? false
      }
    };

    return processedData;
  }

  // Load friendship status with caching
  static async loadFriendshipStatus(profileId: number): Promise<FriendshipStatus> {
    // Check cache first
    const cached = this.friendshipStatusCache.get(profileId);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.FRIENDSHIP_CACHE_TIMEOUT) {
      return cached.status;
    }

    try {
      const apiResponse = await BaseApiClient.get<any>(`/api/friends/status/${profileId}`);
      const data = apiResponse.data || apiResponse;

      const status: FriendshipStatus = {
        status: data.status,
        canSendRequest: data.canSendRequest,
        canAcceptRequest: data.canAcceptRequest,
        canCancelRequest: data.canCancelRequest,
        requestId: data.requestId,
      };

      // Cache the result
      this.friendshipStatusCache.set(profileId, {
        status,
        timestamp: now
      });

      return status;
    } catch (error) {
      console.error(`Error loading friendship status for user ${profileId}:`, error);
      throw error;
    }
  }

  // Handle friend actions with proper request ID handling
  static async handleFriendAction(action: FriendAction, targetUserId: number, requestId?: number): Promise<any> {
    switch (action) {
      case 'SEND_FRIEND_REQUEST':
        return await BaseApiClient.post('/api/friends/request', { targetUserId });

      case 'ACCEPT_FRIEND_REQUEST':
        // Use requestId if available, otherwise fall back to targetUserId
        if (requestId) {
          return await BaseApiClient.post(`/api/friends/accept/${requestId}`, {});
        } else {
          return await BaseApiClient.post('/api/friends/accept', { targetUserId });
        }

      case 'REJECT_FRIEND_REQUEST':
        // Use requestId if available, otherwise fall back to targetUserId
        if (requestId) {
          return await BaseApiClient.post(`/api/friends/reject/${requestId}`, {});
        } else {
          return await BaseApiClient.post('/api/friends/reject', { targetUserId });
        }

      case 'CANCEL_FRIEND_REQUEST':
        if (requestId) {
          return await BaseApiClient.delete(`/api/friends/cancel/${requestId}`);
        } else {
          return await BaseApiClient.post('/api/friends/cancel', { targetUserId });
        }

      case 'UNFRIEND':
        return await BaseApiClient.post('/api/friends/unfriend', { targetUserId });

      default:
        throw new Error(`Unsupported friend action: ${action}`);
    }
  }

  // Get pending friend requests (received requests for accept/reject actions)
  static async getPendingRequests(): Promise<any[]> {
    const response = await BaseApiClient.get<any>('/api/friends/requests/received');
    return response.data || response || [];
  }

  // Get sent friend requests
  static async getSentRequests(): Promise<any[]> {
    const response = await BaseApiClient.get<any>('/api/friends/requests/sent');
    return response.data || response || [];
  }

  // Get friends list with proper online status handling
  static async getFriendsList(): Promise<{ success: boolean; message: string; data: any[] }> {
    try {
      const response = await BaseApiClient.get<any>('/api/friends');

      let processedData: any[] = [];

      // Handle different response formats and ensure isOnline field is preserved
      if (response.success !== undefined) {
        // Direct API response format
        processedData = response.data || [];
      } else if (Array.isArray(response)) {
        // Array response format
        processedData = response;
      } else if (response.data) {
        // Nested data response format
        processedData = response.data;
      } else {
        return {
          success: false,
          message: 'Invalid response format',
          data: []
        };
      }

      // Ensure each friend object has the correct isOnline field
      const normalizedData = processedData.map((friend: any) => {
        return {
          ...friend,
          // Map "online" field to "isOnline" since backend uses "online"
          isOnline: Boolean(friend.online || friend.isOnline),
          // Handle any potential field mapping issues
          userId: friend.userId || friend.id,
          avatarUrl: friend.avatarUrl || null,
          department: friend.department || null,
          jobTitle: friend.jobTitle || null,
          friendsSince: friend.friendsSince || new Date().toISOString()
        };
      });

      return {
        success: true,
        message: response.message || 'Lấy danh sách bạn bè thành công',
        data: normalizedData
      };
    } catch (error) {
      console.error('❌ ProfileService: Error fetching friends list:', error);
      throw error;
    }
  }

  // ==== ONLINE STATUS METHODS - DB-based ====

  /**
   * Get online status for a specific user from profile data
   * @param userId User ID to check
   * @returns Online status information
   */
  static async getUserOnlineStatus(userId: number): Promise<OnlineStatus> {
    try {
      // Get user profile which includes online status
      const profile = await BaseApiClient.get<ProfileData>(`/api/user-profiles/${userId}`);

      return {
        status: profile.onlineStatus || 'offline',
        lastSeen: profile.lastSeen || null,
        isOnline: profile.isOnline || false
      };
    } catch (error) {
      console.error('Failed to fetch user online status:', error);
      // Return default offline status on error
      return {
        status: 'offline',
        lastSeen: null,
        isOnline: false
      };
    }
  }

  /**
   * Get online status for multiple users - removed bulk endpoint
   * Falls back to individual calls for now
   */
  static async getBulkOnlineStatus(userIds: number[]): Promise<Map<number, OnlineStatus>> {
    const result = new Map<number, OnlineStatus>();

    // For now, just return empty map to avoid API calls
    // Online status will be included in profile responses
    return result;
  }

  /**
   * Set online status through auth endpoints only
   * This should be called by AuthController on login/logout
   */
  static async setOnlineStatus(status: 'online' | 'away' | 'offline'): Promise<void> {
    // Online status is now managed by AuthController
    // No separate endpoint needed - just log for debugging
    console.log(`Online status set to: ${status}`);
  }

  /**
   * Update last seen - removed separate endpoint
   * This is now handled automatically by backend interceptor
   */
  static async updateLastSeen(): Promise<void> {
    // Last seen is now updated automatically by backend
    // No manual API call needed
    console.debug('Last seen updated automatically by backend');
  }

  /**
   * Clear friendship status cache for a specific user or all users
   */
  static clearFriendshipStatusCache(userId?: number): void {
    if (userId) {
      this.friendshipStatusCache.delete(userId);
    } else {
      this.friendshipStatusCache.clear();
    }
  }

  /**
   * Clear online status cache
   */
  static clearOnlineStatusCache(): void {
    this.onlineStatusCache.clear();
  }

  /**
   * Clear all caches
   */
  static clearAllCaches(): void {
    this.clearOnlineStatusCache();
    this.clearFriendshipStatusCache();
  }
}

// Export EditProfileService
export { default as EditProfileService } from './editProfileService';
export * from './editProfileService';
