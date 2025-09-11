import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TabType, ProfileData } from '@/types/profile';

export const useProfileTabs = (profileData: ProfileData | null, isOwnProfile: boolean, userId?: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const tabs = [
    {
      id: 'posts' as TabType,
      label: 'Posts',
      count: profileData?.tabCounts.postsCount || 0,
      href: isOwnProfile ? '/profile/me/posts' : `/profile/${userId}/posts`
    },
    {
      id: 'friends' as TabType,
      label: 'Friends',
      count: profileData?.tabCounts.friendsCount || 0,
      href: isOwnProfile ? '/profile/me/friends' : `/profile/${userId}/friends`
    },
    {
      id: 'portfolio' as TabType,
      label: 'Portfolio',
      count: profileData?.tabCounts.tasksCount || 0,
      href: isOwnProfile ? '/profile/me/portfolio' : `/profile/${userId}/portfolio`
    },
  ];

  // Set active tab based on current path
  useEffect(() => {
    if (pathname.includes('/friends')) {
      setActiveTab('friends');
    } else if (pathname.includes('/posts')) {
      setActiveTab('posts');
    } else if (pathname.includes('/portfolio')) {
      setActiveTab('portfolio');
    } else {
      setActiveTab('posts');
      // Redirect to posts tab if on base profile page
      if (pathname === '/profile' || pathname === '/profile/' || pathname === `/profile/${userId}`) {
        const targetHref = isOwnProfile ? '/profile/me/posts' : `/profile/${userId}/posts`;
        router.push(targetHref);
      }
    }
  }, [pathname, router, userId, isOwnProfile]);

  // Handle tab change
  const handleTabChange = (tabId: TabType) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      router.push(tab.href);
    }
  };

  return {
    activeTab,
    tabs,
    handleTabChange
  };
};
