"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import PageLayout from "@/layouts/page/PageLayout";
import Button from "@/components/ui/Button/Button";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { DARK_THEME } from "@/constants/theme";
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, usePathname, useParams } from "next/navigation";
import {
  Camera,
  Users,
  FileText,
  Briefcase,
  Edit3,
  UserPlus,
  UserMinus,
  Clock,
  Check,
  X
} from "lucide-react";

// Types for friendship relationships
type FriendshipStatus = "friends" | "pending_sent" | "pending_received" | "not_friends";

// Mock user data - replace with real data from API
const mockUserData = {
  "user_456": {
    id: "user_456",
    name: "Jane Smith",
    displayName: "jane.smith@company.com",
    bio: "UX Designer creating beautiful experiences",
    location: "New York, NY",
    joinDate: "Joined March 2023",
    avatar: null,
    coverPhoto: null,
    jobTitle: "UX Designer",
    company: "Design Studio",
    followingCount: 45,
    followerCount: 28,
    roles: ["designer", "ui"],
    verified: false,
    relationshipStatus: "not_friends" as FriendshipStatus,
    mutualFriends: 5,
    canViewFriends: false
  }
};

type TabType = 'friends' | 'posts' | 'portfolio';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const UserProfileLayout = ({ children }: ProfileLayoutProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [relationshipStatus, setRelationshipStatus] = useState<FriendshipStatus>("not_friends");
  const [loading, setLoading] = useState(false);

  const userId = params.id as string;
  const isOwnProfile = userId === 'me' || userId === user?.id;

  // Mock user data - replace with API call
  const profileUser = mockUserData[userId as keyof typeof mockUserData] || {
    id: userId,
    name: "Unknown User",
    displayName: "user@example.com",
    bio: "User profile",
    location: "Unknown",
    joinDate: "Recently joined",
    avatar: null,
    coverPhoto: null,
    followingCount: 0,
    followerCount: 0,
    roles: [],
    verified: false,
    relationshipStatus: "not_friends" as FriendshipStatus,
    mutualFriends: 0,
    canViewFriends: false
  };

  // Set initial relationship status
  useEffect(() => {
    if (!isOwnProfile) {
      setRelationshipStatus(profileUser.relationshipStatus);
    }
  }, [isOwnProfile, profileUser.relationshipStatus]);

  // Generate avatar background for Facebook-like effect
  const avatarBackgroundUrl = useMemo(() => {
    if (profileUser.avatar) {
      return profileUser.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&size=400&background=6366f1&color=ffffff&format=png`;
  }, [profileUser.avatar, profileUser.name]);

  const tabs = [
    { id: 'posts' as TabType, label: 'Posts', count: 12, href: `/profile/${userId}/posts` },
    { id: 'friends' as TabType, label: 'Friends', count: profileUser.followerCount, href: `/profile/${userId}/friends` },
    { id: 'portfolio' as TabType, label: 'Portfolio', count: 8, href: `/profile/${userId}/portfolio` },
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
    }
  }, [pathname]);

  // Handle tab change
  const handleTabChange = (tabId: TabType) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      router.push(tab.href);
    }
  };

  // Friend action handlers
  const handleSendFriendRequest = async () => {
    setLoading(true);
    try {
      // API call would go here
      setRelationshipStatus("pending_sent");
      console.log("Friend request sent to:", userId);
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setLoading(true);
    try {
      // API call would go here
      setRelationshipStatus("not_friends");
      console.log("Friend request cancelled for:", userId);
    } catch (error) {
      console.error("Error cancelling friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setLoading(true);
    try {
      // API call would go here
      setRelationshipStatus("friends");
      console.log("Friend request accepted from:", userId);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    setLoading(true);
    try {
      // API call would go here
      setRelationshipStatus("not_friends");
      console.log("Friend request rejected from:", userId);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async () => {
    setLoading(true);
    try {
      // API call would go here
      setRelationshipStatus("not_friends");
      console.log("Unfriended user:", userId);
    } catch (error) {
      console.error("Error unfriending user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render relationship action button
  const renderRelationshipButton = () => {
    if (isOwnProfile) {
      return (
        <Button
          variant="primary"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3 sm:px-4 py-2 transition-colors duration-200"
          onClick={() => console.log("Edit profile")}
        >
          <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Edit profile
        </Button>
      );
    }

    const buttonProps = {
      size: "sm" as const,
      disabled: loading,
      className: "text-xs sm:text-sm px-3 sm:px-4 py-2 transition-all duration-200"
    };

    switch (relationshipStatus) {
      case "not_friends":
        return (
          <Button
            {...buttonProps}
            variant="primary"
            onClick={handleSendFriendRequest}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Add Friend
          </Button>
        );

      case "pending_sent":
        return (
          <Button
            {...buttonProps}
            variant="ghost"
            onClick={handleCancelRequest}
            className="border border-gray-600 hover:bg-gray-700"
          >
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Cancel Request
          </Button>
        );

      case "pending_received":
        return (
          <div className="flex gap-2">
            <Button
              {...buttonProps}
              variant="primary"
              onClick={handleAcceptRequest}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Accept</span>
            </Button>
            <Button
              {...buttonProps}
              variant="ghost"
              onClick={handleRejectRequest}
              className="border border-gray-600 hover:bg-gray-700"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Reject</span>
            </Button>
          </div>
        );

      case "friends":
        return (
          <Button
            {...buttonProps}
            variant="ghost"
            onClick={handleUnfriend}
            className="border border-red-600 text-red-400 hover:bg-red-600/10"
          >
            <UserMinus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Unfriend
          </Button>
        );
    }
  };

  // Loading state
  if (isLoading) {
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
            {profileUser.coverPhoto ? (
              <div className="absolute inset-0 z-10">
                <Image
                  src={profileUser.coverPhoto}
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

            {/* Cover Photo Edit Button - Only for own profile */}
            {isOwnProfile && (
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
            )}
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
                      name={profileUser.name}
                      avatar={profileUser.avatar}
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                      style={{ color: DARK_THEME.text.primary }}
                    >
                      {profileUser.name}
                    </h1>
                    {profileUser.verified && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Job Title & Company */}
                  {(profileUser.jobTitle || profileUser.company) && (
                    <p
                      className="text-sm sm:text-base mb-2"
                      style={{ color: DARK_THEME.text.secondary }}
                    >
                      {profileUser.jobTitle}{profileUser.company && ` at ${profileUser.company}`}
                    </p>
                  )}

                  {/* Bio */}
                  {profileUser.bio && (
                    <p
                      className="text-sm mb-2"
                      style={{ color: DARK_THEME.text.secondary }}
                    >
                      {profileUser.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mb-3">
                    <span className="text-xs sm:text-sm" style={{ color: DARK_THEME.text.secondary }}>
                      <strong className="font-semibold">{profileUser.followingCount}</strong>
                      <span className="ml-1">following</span>
                    </span>
                    <span className="text-xs sm:text-sm" style={{ color: DARK_THEME.text.secondary }}>
                      <strong className="font-semibold">{profileUser.followerCount}</strong>
                      <span className="ml-1">follower{profileUser.followerCount !== 1 ? 's' : ''}</span>
                    </span>
                    {!isOwnProfile && profileUser.mutualFriends > 0 && (
                      <span className="text-xs sm:text-sm" style={{ color: DARK_THEME.text.secondary }}>
                        <strong className="font-semibold">{profileUser.mutualFriends}</strong>
                        <span className="ml-1">mutual friends</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
                {renderRelationshipButton()}
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
                    {tab.count && (
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

export default UserProfileLayout;
