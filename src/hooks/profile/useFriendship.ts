import { useMemo, useCallback, useState } from 'react';
import useSWR from 'swr';
import { FriendshipStatus, FriendAction, ProfileData } from '@/types/profile';
import { ProfileService } from '@/services/profile';

export const useFriendship = (profileData: ProfileData | null, isOwnProfile: boolean) => {
  // Track action loading state to prevent duplicate requests
  const [actionLoading, setActionLoading] = useState(false);

  // Tạo SWR key cho friendship status
  const swrKey = useMemo(() => {
    if (isOwnProfile || !profileData?.id) return null;
    return ['friendship', profileData.id];
  }, [isOwnProfile, profileData?.id]);

  // Sử dụng SWR cho friendship status
  const { data: friendshipStatus, error, isLoading, mutate } = useSWR(
    swrKey,
    () => ProfileService.loadFriendshipStatus(profileData!.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3 * 60 * 1000, // 3 minutes
      errorRetryCount: 1,
      fallbackData: undefined
    }
  );

  // Helper function to get optimistic friendship status based on action
  const getOptimisticStatus = useCallback((action: FriendAction, currentStatus: FriendshipStatus | null): FriendshipStatus | null => {
    if (!currentStatus) return null;

    switch (action) {
      case 'SEND_FRIEND_REQUEST':
        return {
          ...currentStatus,
          status: 'REQUEST_SENT',
          canSendRequest: false,
          canCancelRequest: true
        };

      case 'CANCEL_FRIEND_REQUEST':
        return {
          ...currentStatus,
          status: 'NONE',
          canSendRequest: true,
          canCancelRequest: false
        };

      case 'ACCEPT_FRIEND_REQUEST':
        return {
          ...currentStatus,
          status: 'FRIENDS',
          canAcceptRequest: false,
          canCancelRequest: false
        };

      case 'REJECT_FRIEND_REQUEST':
        return {
          ...currentStatus,
          status: 'NONE',
          canAcceptRequest: false,
          canSendRequest: true
        };

      case 'UNFRIEND':
        return {
          ...currentStatus,
          status: 'NONE',
          canSendRequest: true,
          canCancelRequest: false
        };

      default:
        return currentStatus;
    }
  }, []);

  // Optimized friend action handler với optimistic updates
  const handleFriendAction = useCallback(async (action: FriendAction) => {
    if (!profileData?.id || isOwnProfile || isLoading || actionLoading) return;

    // Prevent duplicate requests by checking current status
    if (action === 'SEND_FRIEND_REQUEST' && friendshipStatus?.status === 'REQUEST_SENT') {
      console.log('Friend request already sent, ignoring duplicate request');
      return;
    }

    const originalStatus = friendshipStatus || null;
    setActionLoading(true);

    try {
      // Optimistic update - immediately update UI
      const optimisticStatus = getOptimisticStatus(action, originalStatus);
      if (optimisticStatus) {
        mutate(optimisticStatus, false); // Don't revalidate immediately
      }

      // Perform the actual API call
      await ProfileService.handleFriendAction(action, profileData.id, friendshipStatus?.requestId);

      // Revalidate from server to get the real status
      mutate();

      // Clear friendship cache to ensure fresh data on next load
      ProfileService.clearFriendshipCache?.(profileData.id);

    } catch (error: any) {
      const errorMessage = error?.message || '';

      // Handle specific error cases where the optimistic update should remain
      if (errorMessage.includes('Friend request already sent') || errorMessage.includes('already sent')) {
        // Keep the optimistic update for "already sent" case - this means it worked!
        console.log('✅ Friend request already sent - keeping REQUEST_SENT status');
        const sentStatus = getOptimisticStatus('SEND_FRIEND_REQUEST', originalStatus);
        if (sentStatus) {
          mutate(sentStatus, false);
        }
        // Don't refetch immediately since we want to keep the optimistic state
        return; // Exit early, don't refetch

      } else if (errorMessage.includes('Friend request not found') && action === 'CANCEL_FRIEND_REQUEST') {
        // Request was already cancelled or doesn't exist, set to NONE status
        console.log('✅ Friend request not found - setting to NONE status (already cancelled)');
        const noneStatus = getOptimisticStatus('CANCEL_FRIEND_REQUEST', originalStatus);
        if (noneStatus) {
          mutate(noneStatus, false);
        }
        return; // Exit early, don't refetch

      } else if (errorMessage.includes('already friends') || errorMessage.includes('Already friends')) {
        // Handle "already friends" case
        console.log('✅ Already friends - setting to FRIENDS status');
        const friendsStatus = getOptimisticStatus('ACCEPT_FRIEND_REQUEST', originalStatus);
        if (friendsStatus) {
          mutate(friendsStatus, false);
        }
        return; // Exit early, don't refetch

      } else {
        // For genuine errors, revert optimistic update and refetch
        console.error(`❌ Genuine error occurred for action ${action}:`, errorMessage);
        mutate(); // Refetch from server immediately
        throw error; // Propagate the error for real error cases
      }
    } finally {
      setActionLoading(false);
    }
  }, [profileData?.id, isOwnProfile, isLoading, actionLoading, friendshipStatus, mutate, getOptimisticStatus]);

  return {
    friendshipStatus: friendshipStatus as FriendshipStatus | null,
    loading: isLoading || actionLoading,
    error: error?.message || null,
    handleFriendAction,
    refresh: mutate
  };
};
