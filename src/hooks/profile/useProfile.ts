import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { ProfileService } from '@/services/profile';
import { ProfileData } from '@/types/profile';

export const useProfile = () => {
  const { user } = useAuth();
  const params = useParams();

  // Memoize userId và isOwnProfile để tránh re-calculation
  const userId = useMemo(() => params.id as string | undefined, [params.id]);
  const isOwnProfile = useMemo(() =>
    !userId || userId === "me" || (user && userId === user.id?.toString()),
    [userId, user?.id]
  );

  // Tạo SWR key stable
  const swrKey = useMemo(() => {
    if (!user) return null;
    return isOwnProfile ? ['profile', 'me'] : ['profile', userId];
  }, [user, isOwnProfile, userId]);

  // Sử dụng SWR thay vì tự quản lý state
  const { data: profileData, error, isLoading, mutate } = useSWR(
    swrKey,
    () => ProfileService.loadProfileData(userId, isOwnProfile ?? false),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
      errorRetryCount: 2,
      fallbackData: undefined
    }
  );

  return {
    profileData: profileData as ProfileData | null,
    loading: isLoading,
    error: error?.message || null,
    isOwnProfile,
    userId: userId || user?.id?.toString(),
    refresh: mutate
  };
};
