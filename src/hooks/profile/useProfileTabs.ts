import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TabType, ProfileData } from '@/types/profile';

export const useProfileTabs = (profileData: ProfileData | null, isOwnProfile: boolean, userId?: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  // Memoize tabs array to prevent recreation on every render
  const tabs = useMemo(() => [
    {
      id: 'posts' as TabType,
      label: 'Posts',
      count: profileData?.tabCounts?.postsCount || 0,
      href: isOwnProfile ? '/profile/me/posts' : `/profile/${userId}/posts`
    },
    {
      id: 'friends' as TabType,
      label: 'Friends',
      count: profileData?.tabCounts?.friendsCount || 0,
      href: isOwnProfile ? '/profile/me/friends' : `/profile/${userId}/friends`
    },
    {
      id: 'portfolio' as TabType,
      label: 'Portfolio',
      count: profileData?.tabCounts?.tasksCount || 0,
      href: isOwnProfile ? '/profile/me/portfolio' : `/profile/${userId}/portfolio`
    },
  ], [profileData?.tabCounts, isOwnProfile, userId]);

  // Memoize tab detection logic
  const getTabFromPath = useCallback((path: string): TabType => {
    if (path.includes('/friends')) return 'friends';
    if (path.includes('/portfolio')) return 'portfolio';
    return 'posts';
  }, []);

  // Optimized useEffect to set active tab from URL
  useEffect(() => {
    const newTab = getTabFromPath(pathname);

    // Only update if tab actually changed
    setActiveTab(prevTab => prevTab !== newTab ? newTab : prevTab);

    // Redirect if on base profile page
    if (pathname === '/profile' || pathname === '/profile/' || pathname === `/profile/${userId}`) {
      const targetHref = isOwnProfile ? '/profile/me/posts' : `/profile/${userId}/posts`;
      router.replace(targetHref);
    }
  }, [pathname, router, userId, isOwnProfile, getTabFromPath]);

  // Memoized tab change handler
  const handleTabChange = useCallback((tabId: TabType) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tab.href !== pathname) {
      setActiveTab(tabId);
      router.push(tab.href);
    }
  }, [tabs, router, pathname]);

  return {
    activeTab,
    tabs,
    handleTabChange
  };
};
