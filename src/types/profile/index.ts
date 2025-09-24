// Profile types and interfaces
export interface ProfileData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  department?: string;
  jobTitle?: string;
  aboutMe?: string;
  joinedAt: string;
  isPremium: boolean;
  premiumExpiry?: string;
  premiumBadgeUrl?: string;
  friendshipStatus?: {
    status: 'NOT_FRIENDS' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';
    canSendRequest: boolean;
    canAcceptRequest: boolean;
    mutualFriendsCount: number;
  };
  isOwnProfile: boolean;
  tabCounts: {
    postsCount: number;
    friendsCount: number;
    tasksCount: number;
    publicTasksCount: number;
    sharedTasksCount: number;
  };
  stats: {
    totalPosts: number;
    totalFriends: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    mutualFriendsCount: number;
    taskCompletionRate: number;
    isOwnProfile: boolean;
  };
  // Online status fields - DB-based only
  isOnline: boolean;
  onlineStatus: 'online' | 'away' | 'offline';
  lastSeen: string | null;
}

export type TabType = 'friends' | 'posts';

export interface FriendshipStatus {
  status: string;
  canSendRequest: boolean;
  canAcceptRequest: boolean;
  canCancelRequest: boolean;
  requestId?: number;
}

export type FriendAction =
  | 'SEND_FRIEND_REQUEST'
  | 'CANCEL_FRIEND_REQUEST'
  | 'ACCEPT_FRIEND_REQUEST'
  | 'REJECT_FRIEND_REQUEST'
  | 'UNFRIEND';
