import { useState, useEffect, useCallback } from 'react';
import { FriendshipStatus, FriendAction, ProfileData } from '@/types/profile';
import { ProfileService } from '@/services/profile';

export const useFriendship = (profileData: ProfileData | null, isOwnProfile: boolean) => {
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple load function without complex caching logic
  const loadFriendshipStatus = useCallback(async () => {
    if (isOwnProfile || !profileData || loading) return;

    setLoading(true);
    setError(null);

    try {
      const status = await ProfileService.loadFriendshipStatus(profileData.id);
      setFriendshipStatus(status);
    } catch (error) {
      console.error("Error loading friendship status:", error);
      setError(error instanceof Error ? error.message : 'Failed to load friendship status');
      setFriendshipStatus({
        status: 'NONE',
        canSendRequest: true,
        canAcceptRequest: false,
        canCancelRequest: false,
      });
    } finally {
      setLoading(false);
    }
  }, [isOwnProfile, profileData?.id, loading]);

  // Simple friend action handler
  const handleFriendAction = useCallback(async (action: FriendAction) => {
    if (!profileData || isOwnProfile || loading) return;

    setLoading(true);

    try {
      await ProfileService.handleFriendAction(action, profileData.id, friendshipStatus?.requestId);
      // Simply reload status after action
      await loadFriendshipStatus();
    } catch (error) {
      console.error(`Error performing friend action ${action}:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action}`);
    } finally {
      setLoading(false);
    }
  }, [profileData, isOwnProfile, loading, friendshipStatus?.requestId, loadFriendshipStatus]);

  // Load once when profile changes
  useEffect(() => {
    if (profileData && !isOwnProfile) {
      loadFriendshipStatus();
    } else {
      setFriendshipStatus(null);
      setError(null);
    }
  }, [profileData?.id, isOwnProfile]); // Removed loadFriendshipStatus from deps to prevent loop

  return {
    friendshipStatus,
    loading,
    error,
    handleFriendAction,
    refetchFriendshipStatus: loadFriendshipStatus,
  };
};
