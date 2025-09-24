"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useChatContext } from '@/contexts/ChatContext';
import { useFriendsList, FriendData } from '@/hooks/profile/useFriendsList';
import { useFriendship } from '@/hooks/profile/useFriendship';
import { useGlobalData } from '@/contexts/GlobalDataContext';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Users, UserPlus, MessageCircle, UserMinus, Loader2, Search, Clock, Check, X, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { ProfileService } from '@/services/profile';

// Enhanced Friend Request interface
interface FriendRequest {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  department?: string;
  jobTitle?: string;
  status: string;
  isSender: boolean;
  createdAt: string;
}

// Profile Data interface for target user
interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  isOwnProfile: boolean;
}

type TabType = 'friends' | 'received' | 'sent';

export default function UserFriendsPage() {
  const { id: userId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { openChatWindow } = useChatContext();
  const { invalidatePostsCache } = useGlobalData();
  const { theme, isLoading: themeLoading } = useThemeContext();
  const { messages } = useLanguageContext();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Check if viewing own profile
  const isOwnProfile = !userId || userId === "me" || (user && userId === user.id?.toString());

  // Get target user ID for friends list
  const targetUserId = isOwnProfile ? undefined : parseInt(userId as string);

  // Use friends list hook for real-time friends data with online status
  const {
    friends,
    friendsCount,
    loading: friendsLoading,
    error: friendsError,
    loadFriends,
    removeFriend,
    searchFriends
  } = useFriendsList(targetUserId);

  // Use friendship hook for target user (when viewing others' profiles)
  const {
    friendshipStatus,
    loading: friendshipLoading,
    handleFriendAction: handleTargetUserFriendAction
  } = useFriendship(
    isOwnProfile ? null : (profileData ? {
      id: profileData.id,
      email: '',
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      username: profileData.username,
      avatarUrl: profileData.avatarUrl,
      coverImageUrl: null,
      department: '',
      jobTitle: '',
      aboutMe: '',
      joinedAt: new Date().toISOString(),
      isPremium: false,
      isOwnProfile: profileData.isOwnProfile,
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
        isOwnProfile: profileData.isOwnProfile
      },
      isOnline: false,
      onlineStatus: 'offline' as const,
      lastSeen: null
    } : null),
    Boolean(isOwnProfile)
  );

  // Load profile data for target user
  const loadProfileData = async () => {
    if (isOwnProfile || !userId) {
      setProfileData({
        id: Number(user?.id) || 0,
        firstName: user?.name?.split(' ')[0] || 'User',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        username: user?.email?.split('@')[0] || 'user',
        avatarUrl: user?.avatar || null,
        isOwnProfile: true
      });
      return;
    }

    try {
      const userIdString = Array.isArray(userId) ? userId[0] : userId;
      const response = await ProfileService.loadProfileData(userIdString, false);
      setProfileData({
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        username: response.username,
        avatarUrl: response.avatarUrl,
        isOwnProfile: false
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError(messages.friendtab.error.loadProfile);
    }
  };

  // Load received friend requests
  const loadReceivedRequests = async () => {
    if (!isOwnProfile) return;

    try {
      const data = await ProfileService.getPendingRequests();
      setReceivedRequests(data || []);
    } catch (error) {
      console.error("Error loading received requests:", error);
      setReceivedRequests([]);
    }
  };

  // Load sent friend requests
  const loadSentRequests = async () => {
    if (!isOwnProfile) return;

    try {
      const data = await ProfileService.getSentRequests();
      setSentRequests(data || []);
    } catch (error) {
      console.error("Error loading sent requests:", error);
      setSentRequests([]);
    }
  };

  // Load all data based on active tab
  const loadData = async () => {
    if (!isOwnProfile && activeTab !== 'friends') return;

    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'friends':
          await loadFriends();
          break;
        case 'received':
          await loadReceivedRequests();
          break;
        case 'sent':
          await loadSentRequests();
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle friend click to navigate to their profile
  const handlePersonClick = (personId: number) => {
    router.push(`/profile/${personId}/posts`);
  };

  // Handle message friend
  const handleMessageFriend = async (friend: FriendData) => {
    try {
      openChatWindow({
        id: friend.userId,
        name: `${friend.firstName} ${friend.lastName}`,
        firstName: friend.firstName,
        lastName: friend.lastName,
        email: friend.email,
        avatarUrl: friend.avatarUrl || undefined,
        isOnline: friend.isOnline
      });
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  // Handle unfriend with confirmation
  const handleUnfriend = async (friend: FriendData) => {
    const confirmMessage = messages.friendtab.confirmation.unfriend.replace('{name}', `${friend.firstName} ${friend.lastName}`);

    if (!confirm(confirmMessage)) return;

    const actionKey = `unfriend-${friend.userId}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));

    try {
      await ProfileService.handleFriendAction('UNFRIEND', friend.userId);

      // Remove from local friends list
      removeFriend(friend.userId);

      // Invalidate posts cache to refresh any friend-only posts
      invalidatePostsCache();

      console.log(`✅ Successfully unfriended ${friend.firstName} ${friend.lastName}`);
    } catch (error) {
      console.error('Error unfriending:', error);
      setError(error instanceof Error ? error.message : messages.friendtab.error.unfriendUser);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // Handle friend request actions
  const handleRequestAction = async (request: FriendRequest, action: 'accept' | 'reject' | 'cancel') => {
    const actionKey = `${action}-${request.id}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));

    try {
      let friendAction;
      switch (action) {
        case 'accept':
          friendAction = 'ACCEPT_FRIEND_REQUEST';
          break;
        case 'reject':
          friendAction = 'REJECT_FRIEND_REQUEST';
          break;
        case 'cancel':
          friendAction = 'CANCEL_FRIEND_REQUEST';
          break;
      }

      await ProfileService.handleFriendAction(friendAction as any, request.userId, request.id);

      // Update local state
      if (action === 'accept') {
        // Remove from received requests
        setReceivedRequests(prev => prev.filter(r => r.id !== request.id));
        // Reload friends list to include new friend
        await loadFriends();
      } else {
        // Remove from respective request list
        if (activeTab === 'received') {
          setReceivedRequests(prev => prev.filter(r => r.id !== request.id));
        } else {
          setSentRequests(prev => prev.filter(r => r.id !== request.id));
        }
      }

      console.log(`✅ Successfully ${action}ed friend request`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      setError(error instanceof Error ? error.message : messages.friendtab.error[`${action}Request` as keyof typeof messages.friendtab.error]);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // Filter data based on search query
  const getFilteredData = () => {
    let data: (FriendData | FriendRequest)[] = [];

    switch (activeTab) {
      case 'friends':
        data = searchQuery ? searchFriends(searchQuery) : friends;
        break;
      case 'received':
        data = receivedRequests;
        break;
      case 'sent':
        data = sentRequests;
        break;
    }

    // Apply search filter for non-friends tabs
    if (searchQuery && activeTab !== 'friends') {
      return data.filter(item => {
        const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const username = item.username.toLowerCase();
        const email = item.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || username.includes(query) || email.includes(query);
      });
    }

    return data;
  };

  const filteredData = getFilteredData();

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  // Render online status indicator - memoized to prevent re-renders
  const renderOnlineStatus = useCallback((isOnline: boolean) => {
    return (
      <div className="flex items-center gap-1 text-xs">
        {isOnline ? (
          <>
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme.status.success }}
            />
            <span style={{ color: theme.status.success }}>{messages.friendtab.status.online}</span>
          </>
        ) : (
          <>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.text.muted }}
            />
            <span style={{ color: theme.text.muted }}>{messages.friendtab.status.offline}</span>
          </>
        )}
      </div>
    );
  }, [theme, messages]);

  // Render individual friend card with enhanced features
  const renderFriendCard = (friend: FriendData) => {
    const fullName = `${friend.firstName} ${friend.lastName}`;
    const jobInfo = friend.jobTitle && friend.department
      ? `${friend.jobTitle} at ${friend.department}`
      : friend.jobTitle || friend.department || messages.friendtab.status.teamMember;

    const isOnline = Boolean(friend.isOnline);
    const unfriendLoading = actionLoading[`unfriend-${friend.userId}`];

    return (
      <BaseCard
        key={friend.userId}
        title=""
        variant="compact"
        className="transition-colors cursor-pointer group hover:opacity-90"
      >
        <div
          className="p-4"
          onClick={() => handlePersonClick(friend.userId)}
          style={{ borderColor: theme.border.default }}
        >
          <div className="flex items-start space-x-3">
            <div className="relative">
              <UserAvatar
                name={fullName}
                avatar={friend.avatarUrl || undefined}
                size="md"
                variant="circle"
                className="flex-shrink-0"
                fallbackColor={theme.status.info}
              />
              {/* Online status indicator */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{
                  backgroundColor: isOnline ? theme.status.success : theme.text.muted,
                  borderColor: theme.background.primary
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-base truncate transition-colors hover:opacity-80"
                style={{ color: theme.text.primary }}
              >
                {fullName}
              </h3>
              <p
                className="text-sm truncate mb-1"
                style={{ color: theme.text.secondary }}
              >
                {jobInfo}
              </p>

              {/* Online status and friends since */}
              <div className="flex items-center justify-between mb-3">
                {renderOnlineStatus(isOnline)}
                {friend.friendsSince && (
                  <span
                    className="text-xs"
                    style={{ color: theme.text.muted }}
                  >
                    {messages.friendtab.status.friendsSince.replace('{date}', formatDate(friend.friendsSince))}
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessageFriend(friend);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {messages.friendtab.actions.message}
                </Button>

                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfriend(friend);
                    }}
                    disabled={unfriendLoading}
                  >
                    {unfriendLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    );
  };

  // Render friend request card with enhanced features
  const renderRequestCard = (request: FriendRequest) => {
    const fullName = `${request.firstName} ${request.lastName}`;
    const jobInfo = request.jobTitle && request.department
      ? `${request.jobTitle} at ${request.department}`
      : request.jobTitle || request.department || messages.friendtab.status.teamMember;

    const acceptLoading = actionLoading[`accept-${request.id}`];
    const rejectLoading = actionLoading[`reject-${request.id}`];
    const cancelLoading = actionLoading[`cancel-${request.id}`];

    return (
      <BaseCard
        key={request.id}
        title=""
        variant="compact"
        className="transition-colors cursor-pointer hover:opacity-90"
      >
        <div className="p-4" onClick={() => handlePersonClick(request.userId)}>
          <div className="flex items-start space-x-3">
            <UserAvatar
              name={fullName}
              avatar={request.avatarUrl || undefined}
              size="md"
              variant="circle"
              className="flex-shrink-0"
              fallbackColor={theme.status.info}
            />

            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-base truncate transition-colors hover:opacity-80"
                style={{ color: theme.text.primary }}
              >
                {fullName}
              </h3>
              <p
                className="text-sm truncate mb-1"
                style={{ color: theme.text.secondary }}
              >
                {jobInfo}
              </p>
              <p
                className="text-xs mb-3"
                style={{ color: theme.text.muted }}
              >
                {formatDate(request.createdAt)}
              </p>

              {/* Action buttons based on tab */}
              <div className="flex gap-2 mt-3">
                {activeTab === 'received' ? (
                  // Received requests: Accept/Decline
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestAction(request, 'accept');
                      }}
                      disabled={acceptLoading || rejectLoading}
                    >
                      {acceptLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      {messages.friendtab.actions.accept}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestAction(request, 'reject');
                      }}
                      disabled={acceptLoading || rejectLoading}
                    >
                      {rejectLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  // Sent requests: Cancel
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestAction(request, 'cancel');
                    }}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Clock className="w-4 h-4 mr-1" />
                    )}
                    {messages.friendtab.actions.cancel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    );
  };

  // Initialize data loading
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user, userId, isOwnProfile]);

  useEffect(() => {
    if (user && profileData) {
      loadData();
    }
  }, [user, profileData, activeTab]);

  // Get tab counts
  const getTabCounts = () => ({
    friends: friendsCount,
    received: receivedRequests.length,
    sent: sentRequests.length
  });

  const tabCounts = getTabCounts();
  const isDataLoading = loading || friendsLoading;
  const dataError = error || friendsError;

  if (themeLoading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ backgroundColor: theme.background.primary }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.status.info }} />
      </div>
    );
  }

  return (
    <div
      className="p-6 max-w-6xl mx-auto"
      style={{ backgroundColor: theme.background.primary, color: theme.text.primary }}
    >
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: theme.text.primary }}
            >
              {isOwnProfile
                ? messages.friendtab.title.yourFriends
                : messages.friendtab.title.userFriends.replace('{name}', profileData?.firstName || 'User')
              }
            </h1>
            <p style={{ color: theme.text.secondary }}>
              {isDataLoading
                ? messages.friendtab.status.loading
                : `${filteredData.length} ${
                    activeTab === 'friends' 
                      ? (filteredData.length === 1 ? messages.friendtab.counts.friend : messages.friendtab.counts.friends)
                      : (filteredData.length === 1 ? messages.friendtab.counts.request : messages.friendtab.counts.requests)
                  }`
              }
            </p>
          </div>

          {/* Find Friends Button - Only for own profile */}
          {isOwnProfile && (
            <Button
              variant="primary"
              onClick={() => router.push('/discover/people')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {messages.friendtab.actions.findFriends}
            </Button>
          )}
        </div>

        {/* Tabs - Only show for own profile */}
        {isOwnProfile && (
          <div className="flex space-x-1 mb-4">
            <Button
              variant={activeTab === 'friends' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('friends')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              {messages.friendtab.tabs.friends}
              {tabCounts.friends > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: theme.badge.background,
                    color: theme.badge.text
                  }}
                >
                  {tabCounts.friends}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'received' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('received')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {messages.friendtab.tabs.received}
              {tabCounts.received > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: theme.badge.background,
                    color: theme.badge.text
                  }}
                >
                  {tabCounts.received}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'sent' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('sent')}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {messages.friendtab.tabs.sent}
              {tabCounts.sent > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: theme.badge.background,
                    color: theme.badge.text
                  }}
                >
                  {tabCounts.sent}
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Search Bar */}
        {filteredData.length > 0 && (
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: theme.text.muted }}
            />
            <input
              type="text"
              placeholder={
                activeTab === 'friends'
                  ? messages.friendtab.search.searchFriends
                  : messages.friendtab.search.searchRequests
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
            />
          </div>
        )}
      </div>

      {/* Error State */}
      {dataError && (
        <BaseCard title="" variant="compact">
          <div className="text-center py-8">
            <AlertCircle
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: theme.status.error }}
            />
            <p
              className="mb-4"
              style={{ color: theme.status.error }}
            >
              {messages.friendtab.error.loadingData}
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: theme.text.muted }}
            >
              {dataError}
            </p>
            <Button
              variant="ghost"
              onClick={loadData}
            >
              {messages.friendtab.actions.tryAgain}
            </Button>
          </div>
        </BaseCard>
      )}

      {/* Loading State */}
      {isDataLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: theme.status.info }}
          />
          <span
            className="ml-2"
            style={{ color: theme.text.muted }}
          >
            {messages.friendtab.status.loading}
          </span>
        </div>
      )}

      {/* Empty State */}
      {!isDataLoading && !dataError && filteredData.length === 0 && !searchQuery && (
        <BaseCard title="" variant="compact">
          <div className="text-center py-12">
            {activeTab === 'friends' ? (
              <>
                <Users
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: theme.text.muted }}
                />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: theme.text.primary }}
                >
                  {isOwnProfile
                    ? messages.friendtab.empty.noFriends.title
                    : messages.friendtab.empty.noFriendsToShow.title
                  }
                </h3>
                <p
                  className="mb-4"
                  style={{ color: theme.text.secondary }}
                >
                  {isOwnProfile
                    ? messages.friendtab.empty.noFriends.description
                    : messages.friendtab.empty.noFriendsToShow.description
                  }
                </p>
                {isOwnProfile && (
                  <Button
                    variant="primary"
                    onClick={() => router.push('/discover/people')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {messages.friendtab.actions.findFriends}
                  </Button>
                )}
              </>
            ) : activeTab === 'received' ? (
              <>
                <Clock
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: theme.text.muted }}
                />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: theme.text.primary }}
                >
                  {messages.friendtab.empty.noReceivedRequests.title}
                </h3>
                <p
                  className="mb-4"
                  style={{ color: theme.text.secondary }}
                >
                  {messages.friendtab.empty.noReceivedRequests.description}
                </p>
              </>
            ) : (
              <>
                <UserPlus
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: theme.text.muted }}
                />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: theme.text.primary }}
                >
                  {messages.friendtab.empty.noSentRequests.title}
                </h3>
                <p
                  className="mb-4"
                  style={{ color: theme.text.secondary }}
                >
                  {messages.friendtab.empty.noSentRequests.description}
                </p>
              </>
            )}
          </div>
        </BaseCard>
      )}

      {/* No Search Results */}
      {!isDataLoading && !dataError && filteredData.length === 0 && searchQuery && (
        <BaseCard title="" variant="compact">
          <div className="text-center py-8">
            <Search
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: theme.text.muted }}
            />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              {messages.friendtab.search.noResults}
            </h3>
            <p
              className="mb-4"
              style={{ color: theme.text.secondary }}
            >
              {messages.friendtab.search.noResultsFor
                .replace('{type}', activeTab === 'friends' ? messages.friendtab.counts.friends : messages.friendtab.counts.requests)
                .replace('{query}', searchQuery)
              }
            </p>
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
            >
              {messages.friendtab.actions.clearSearch}
            </Button>
          </div>
        </BaseCard>
      )}

      {/* Data Grid */}
      {!isDataLoading && !dataError && filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map(item =>
            activeTab === 'friends'
              ? renderFriendCard(item as FriendData)
              : renderRequestCard(item as FriendRequest)
          )}
        </div>
      )}
    </div>
  );
}
