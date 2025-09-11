import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useParams } from 'next/navigation';
import { ProfileData } from '@/types/profile';
import { ProfileService } from '@/services/profile';

export const useProfile = () => {
  const { user } = useAuth();
  const params = useParams();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we're viewing own profile or another user's profile
  const userId = params.id as string | undefined;
  const isOwnProfile = !userId || userId === "me" || (user && userId === user.id?.toString());

  const loadProfileData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const apiData = await ProfileService.loadProfileData(userId, isOwnProfile ?? false);
      console.log('API Response:', apiData);

      // ProfileService already returns properly typed ProfileData, no transformation needed
      setProfileData(apiData);
    } catch (error) {
      console.error("Error loading profile data:", error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');

      // Create fallback profile data
      const fallbackProfileData: ProfileData = {
        id: 0,
        email: user?.email || "user@example.com",
        firstName: isOwnProfile ? (user?.name?.split(' ')[0] || "User") : "Unknown",
        lastName: isOwnProfile ? (user?.name?.split(' ').slice(1).join(' ') || "") : "User",
        username: "user",
        // ✅ SỬA: Fallback data cũng không dùng current user avatar cho user khác
        avatarUrl: isOwnProfile ? (user?.avatar || null) : null,
        coverImageUrl: null,
        department: "Engineering",
        jobTitle: "Team Member",
        aboutMe: isOwnProfile ? "Welcome to TaskFlow!" : "This user hasn't added a bio yet.",
        joinedAt: new Date().toISOString(),
        isPremium: false,
        premiumExpiry: undefined,
        premiumBadgeUrl: "/images/premium-badge.png",
        friendshipStatus: !isOwnProfile ? {
          status: 'NOT_FRIENDS' as const,
          canSendRequest: true,
          canAcceptRequest: false,
          mutualFriendsCount: 0
        } : undefined,
        isOwnProfile: isOwnProfile ?? false,
        // ✅ THÊM ONLINE STATUS FIELDS VÀO FALLBACK DATA
        isOnline: false, // Default offline khi có lỗi
        onlineStatus: 'offline',
        lastSeen: null,
        tabCounts: {
          postsCount: 0,
          friendsCount: 0,
          tasksCount: 0,
          publicTasksCount: 0,
          sharedTasksCount: 0
        },
        stats: {
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

      console.log('⚠️ Using fallback profile data with offline status');
      setProfileData(fallbackProfileData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user, userId, isOwnProfile]);

  return {
    profileData,
    loading,
    error,
    isOwnProfile,
    userId,
    refetchProfile: loadProfileData
  };
};
