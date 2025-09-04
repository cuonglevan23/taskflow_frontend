"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import PageLayout from "@/layouts/page/PageLayout";
import Button from "@/components/ui/Button/Button";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { DARK_THEME } from "@/constants/theme";
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, usePathname } from "next/navigation";
import { 
  Camera,
  Edit3,
  Check
} from "lucide-react";

// Profile data interface based on API documentation
interface ProfileData {
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
  friendshipStatus?: any;
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
}

type TabType = 'friends' | 'posts' | 'portfolio';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load profile data from API
  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Try the documented API endpoint first
      let response = await fetch('/api/user-profiles/me/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      // If the main endpoint fails, try alternative endpoints
      if (!response.ok) {
        console.warn(`Primary endpoint failed with status: ${response.status}, trying alternative...`);

        // Try the basic profile endpoint as fallback
        response = await fetch('/api/user-profiles/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('API Response:', apiData); // Debug log

      // Transform API response to match our interface
      // Handle both avtUrl (from basic profile) and avatarUrl (from full profile)
      const profileData: ProfileData = {
        id: apiData.id ?? 0,
        email: apiData.email ?? user?.email ?? "",
        firstName: apiData.firstName ?? user?.name?.split(' ')[0] ?? "User",
        lastName: apiData.lastName ?? user?.name?.split(' ').slice(1).join(' ') ?? "",
        username: apiData.username ?? "user",
        avatarUrl: apiData.avatarUrl ?? apiData.avtUrl ?? user?.avatar ?? null,
        coverImageUrl: apiData.coverImageUrl ?? null,
        department: apiData.department ?? "Unknown Department",
        jobTitle: apiData.jobTitle ?? "Team Member",
        aboutMe: apiData.aboutMe ?? "No bio available",
        joinedAt: apiData.joinedAt ?? new Date().toISOString(),
        isPremium: apiData.premium ?? apiData.isPremium ?? false, // Map 'premium' field from backend
        premiumExpiry: apiData.premiumExpiry ?? undefined,
        premiumBadgeUrl: apiData.premiumBadgeUrl ?? null,
        friendshipStatus: apiData.friendshipStatus ?? null,
        isOwnProfile: apiData.ownProfile ?? apiData.isOwnProfile ?? true, // Map 'ownProfile' field from backend
        tabCounts: apiData.tabCounts ?? {
          postsCount: 0,
          friendsCount: 0,
          tasksCount: 0,
          publicTasksCount: 0,
          sharedTasksCount: 0
        },
        stats: apiData.stats ?? {
          totalPosts: apiData.tabCounts?.postsCount ?? 0,
          totalFriends: apiData.tabCounts?.friendsCount ?? 0,
          totalTasks: apiData.tabCounts?.tasksCount ?? 0,
          completedTasks: 0,
          pendingTasks: 0,
          mutualFriendsCount: 0,
          taskCompletionRate: 0,
          isOwnProfile: true
        }
      };

      setProfileData(profileData);
    } catch (error) {
      console.error("Error loading profile data:", error);

      // Create fallback profile data from user auth context
      const fallbackProfileData: ProfileData = {
        id: 0,
        email: user?.email || "user@example.com",
        firstName: user?.name?.split(' ')[0] || "User",
        lastName: user?.name?.split(' ').slice(1).join(' ') || "",
        username: "user",
        avatarUrl: user?.avatar || null,
        coverImageUrl: null,
        department: "Engineering",
        jobTitle: "Team Member",
        aboutMe: "Welcome to TaskFlow!",
        joinedAt: new Date().toISOString(),
        isPremium: false,
        premiumExpiry: undefined,
        premiumBadgeUrl: "/images/premium-badge.png",
        friendshipStatus: null,
        isOwnProfile: true,
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
          isOwnProfile: true
        }
      };

      setProfileData(fallbackProfileData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  // Generate avatar background for Facebook-like effect
  const avatarBackgroundUrl = useMemo(() => {
    if (profileData?.avatarUrl) {
      return profileData.avatarUrl;
    }
    const fullName = profileData ? `${profileData.firstName} ${profileData.lastName}` : "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=400&background=6366f1&color=ffffff&format=png`;
  }, [profileData?.avatarUrl, profileData?.firstName, profileData?.lastName]);

  const tabs = [
    {
      id: 'posts' as TabType,
      label: 'Posts',
      count: profileData?.tabCounts.postsCount || 0,
      href: '/profile/posts'
    },
    {
      id: 'friends' as TabType,
      label: 'Friends',
      count: profileData?.tabCounts.friendsCount || 0,
      href: '/profile/friends'
    },
    {
      id: 'portfolio' as TabType,
      label: 'Portfolio',
      count: profileData?.tabCounts.tasksCount || 0,
      href: '/profile/portfolio'
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
      // Default to posts tab when on base profile page
      setActiveTab('posts');
      // Redirect to posts tab if on base profile page
      if (pathname === '/profile' || pathname === '/profile/') {
        router.push('/profile/posts');
      }
    }
  }, [pathname, router]);

  // Handle tab change
  const handleTabChange = (tabId: TabType) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      router.push(tab.href);
    }
  };

  // Loading state
  if (isLoading || loading || !profileData) {
    return (
      <PageLayout>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Cover Photo Skeleton */}
          <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse"></div>
          
          {/* Profile Info Skeleton */}
          <div 
            className="relative px-4 sm:px-6 pb-4 sm:pb-6 -mt-12 sm:-mt-16" 
            style={{ backgroundColor: DARK_THEME.background.primary }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-4 sm:space-y-0 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                {/* Avatar Skeleton */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-700 animate-pulse self-center sm:self-auto"></div>
                
                {/* Info Skeleton */}
                <div className="space-y-2 text-center sm:text-left">
                  <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-700 rounded animate-pulse mx-auto sm:mx-0"></div>
                  <div className="h-4 w-24 sm:w-32 bg-gray-700 rounded animate-pulse mx-auto sm:mx-0"></div>
                </div>
              </div>
              
              {/* Button Skeleton */}
              <div className="h-8 sm:h-10 w-24 sm:w-32 bg-gray-700 rounded animate-pulse mx-auto sm:mx-0"></div>
            </div>
          </div>
          
          {/* Tabs Skeleton */}
          <div className="border-b border-gray-700 px-4 sm:px-6">
            <div className="flex space-x-4 sm:space-x-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-16 sm:w-20 bg-gray-700 rounded animate-pulse my-4"></div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header with Cover Photo and Facebook-like Avatar Background */}
        <div className="relative">
          {/* Facebook-style Cover Photo with Avatar Background */}
          <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full relative overflow-hidden">
            {/* Avatar Background Layer (Facebook-like effect) */}
            <div className="absolute inset-0 z-0">
              <Image
                src={avatarBackgroundUrl}
                alt="Avatar background"
                fill
                className="object-cover scale-110 blur-2xl opacity-60"
                style={{
                  filter: 'blur(20px) brightness(0.7) saturate(1.2)',
                }}
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-800/30"></div>
            </div>

            {/* Cover Photo Layer */}
            {profileData.coverImageUrl ? (
              <div className="absolute inset-0 z-10">
                <Image
                  src={profileData.coverImageUrl}
                  alt="Cover photo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              /* Fallback gradient when no cover photo */
              <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-blue-800/40"></div>
            )}
            
            {/* Cover Photo Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 backdrop-blur-sm bg-black/30 text-white border border-white/30 hover:bg-black/40 transition-all duration-200 z-20"
              onClick={() => console.log("Change cover photo")}
            >
              <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Edit cover photo</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          </div>

          {/* Profile Info */}
          <div 
            className="relative px-4 sm:px-6 pb-4 sm:pb-6" 
            style={{ backgroundColor: DARK_THEME.background.primary }}
          >
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 relative z-10">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                {/* Enhanced Avatar with Facebook-like styling */}
                <div className="relative self-center sm:self-auto">
                  <div className="relative">
                    {/* Avatar glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-xl scale-110 animate-pulse"></div>

                    <UserAvatar
                      name={`${profileData.firstName} ${profileData.lastName}`}
                      avatar={profileData.avatarUrl || undefined}
                      size="2xl"
                      variant="circle"
                      className="profile-avatar-responsive shadow-2xl border-4 ring-4 ring-white/20 transition-all duration-300 hover:scale-105 hover:ring-white/30 relative z-10"
                      style={{ borderColor: DARK_THEME.background.primary }}
                      fallbackColor="#f8a5c2"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-8">
                    <h1 
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                      style={{ color: DARK_THEME.text.primary }}
                    >
                      {profileData.firstName} {profileData.lastName}
                    </h1>

                    {/* Premium Badge next to name */}
                    {profileData.isPremium && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full shadow-md border border-white" style={{ backgroundColor: '#1DA1F2' }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  {profileData.email && (
                    <p
                      className="text-sm sm:text-base mb-2"
                      style={{ color: DARK_THEME.text.secondary }}
                    >
                      {profileData.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3 sm:px-4 py-2 transition-colors duration-200"
                  onClick={() => console.log("Edit profile")}
                >
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Edit profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b" style={{ borderColor: DARK_THEME.border.default }}>
          <div className="px-4 sm:px-6">
            <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      profile-nav-tab flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm 
                      whitespace-nowrap flex-shrink-0 group
                      ${isActive 
                        ? 'border-blue-500 active text-blue-400' 
                        : 'border-transparent hover:text-gray-300 hover:border-gray-600'
                      }
                    `}
                    style={{ 
                      color: isActive ? '#60a5fa' : DARK_THEME.text.secondary 
                    }}
                  >
                    <span className="hidden xs:inline">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`
                          px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium
                          transition-all duration-200
                          ${isActive ? 'scale-110' : ''}
                        `}
                        style={{
                          backgroundColor: isActive 
                            ? 'rgba(96, 165, 250, 0.15)' 
                            : DARK_THEME.background.tertiary,
                          color: isActive ? '#60a5fa' : DARK_THEME.text.muted
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-transparent to-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfileLayout;
