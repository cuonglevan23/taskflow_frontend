import { useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { FriendshipStatus, FriendAction, ProfileData } from '@/types/profile';
import { ProfileService } from '@/services/profile';

export const useFriendship = (profileData: ProfileData | null, isOwnProfile: boolean) => {
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

  // Optimized friend action handler với SWR mutate
  const handleFriendAction = useCallback(async (action: FriendAction) => {
    if (!profileData?.id || isOwnProfile || isLoading) return;

    try {
      await ProfileService.handleFriendAction(action, profileData.id, friendshipStatus?.requestId);

      // Mutate SWR cache để update UI ngay lập tức
      mutate();

      // Cũng có thể mutate profile cache nếu cần
      // mutate(['profile', profileData.id.toString()]);

    } catch (error) {
      console.error(`Error performing friend action ${action}:`, error);
      throw error;
    }
  }, [profileData?.id, isOwnProfile, isLoading, friendshipStatus?.requestId, mutate]);

  return {
    friendshipStatus: friendshipStatus as FriendshipStatus | null,
    loading: isLoading,
    error: error?.message || null,
    handleFriendAction,
    refresh: mutate
  };
};
