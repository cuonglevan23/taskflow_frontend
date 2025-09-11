import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '@/services/profile';

// Friend data interface matching API response exactly
export interface FriendData {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  department: string | null;
  jobTitle: string | null;
  friendsSince: string;
  isOnline: boolean;
}

export interface FriendsListResponse {
  success: boolean;
  message: string;
  data: FriendData[];
}

export const useFriendsList = () => {
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load friends list
  const loadFriends = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProfileService.getFriendsList();

      if (response.success) {
        setFriends(response.data || []);
      } else {
        setError(response.message || 'Failed to load friends');
      }
    } catch (error) {
      console.error('❌ Error loading friends list:', error);
      setError(error instanceof Error ? error.message : 'Failed to load friends list');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update online status for a specific friend
  const updateFriendOnlineStatus = useCallback((userId: number, isOnline: boolean) => {
    setFriends(prev =>
      prev.map(friend =>
        friend.userId === userId
          ? { ...friend, isOnline }
          : friend
      )
    );
  }, []);

  // Get online friends only
  const getOnlineFriends = useCallback(() => {
    // ✅ SỬA: Sử dụng field isOnline thay vì online
    return friends.filter(friend => Boolean(friend.isOnline));
  }, [friends]);

  // Get offline friends only
  const getOfflineFriends = useCallback(() => {
    // ✅ SỬA: Sử dụng field isOnline thay vì online
    return friends.filter(friend => !Boolean(friend.isOnline));
  }, [friends]);

  // Search friends by name
  const searchFriends = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return friends;

    const term = searchTerm.toLowerCase();
    return friends.filter(friend => {
      const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
      const email = friend.email.toLowerCase();
      const username = friend.username?.toLowerCase() || '';
      return fullName.includes(term) || email.includes(term) || username.includes(term);
    });
  }, [friends]);

  // Get friend by userId
  const getFriendById = useCallback((userId: number) => {
    return friends.find(friend => friend.userId === userId);
  }, [friends]);

  // Remove friend from list (when unfriended)
  const removeFriend = useCallback((userId: number) => {
    setFriends(prev => prev.filter(friend => friend.userId !== userId));
  }, []);

  // Add new friend to list (when accepted friend request)
  const addFriend = useCallback((newFriend: FriendData) => {
    setFriends(prev => {
      // Check if friend already exists to avoid duplicates
      const exists = prev.some(friend => friend.userId === newFriend.userId);
      if (exists) {
        return prev.map(friend =>
          friend.userId === newFriend.userId ? newFriend : friend
        );
      }
      return [...prev, newFriend];
    });
  }, []);

  // ✅ SỬA: Computed values sử dụng dữ liệu thực từ filtered friends
  const onlineFriends = getOnlineFriends();
  const offlineFriends = getOfflineFriends();

  const friendsCount = friends.length;
  const onlineFriendsCount = onlineFriends.length;
  const offlineFriendsCount = offlineFriends.length;

  // Auto-load friends on mount
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return {
    // Data
    friends,
    friendsCount,
    onlineFriendsCount,
    offlineFriendsCount,

    // States
    loading,
    error,

    // Actions
    loadFriends,
    updateFriendOnlineStatus,
    removeFriend,
    addFriend,

    // Getters
    getOnlineFriends,
    getOfflineFriends,
    searchFriends,
    getFriendById,
  };
};
