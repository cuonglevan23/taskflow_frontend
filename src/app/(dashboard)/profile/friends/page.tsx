"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { DARK_THEME } from "@/constants/theme";
import Button from "@/components/ui/Button/Button";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Users,
  Search,
  UserPlus,
  MoreHorizontal,
  UserMinus,
  Clock,
  Check,
  X,
  Eye,
  Shield
} from "lucide-react";

// Types for friendship relationships
type FriendshipStatus = "NOT_FRIENDS" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIENDS" | "BLOCKED";

interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  department?: string;
  jobTitle?: string;
  isPremium: boolean;
  premiumBadgeUrl?: string;
  friendshipDate?: string;
  isOnline?: boolean;
  lastSeen?: string;
  isMutualFriend?: boolean;
}

interface PendingRequest {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  department?: string;
  jobTitle?: string;
  isPremium: boolean;
  premiumBadgeUrl?: string;
  requestSentAt: string;
  requestType: "RECEIVED" | "SENT";
  canAccept?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
}

interface FriendshipAction {
  currentStatus: FriendshipStatus;
  availableActions: string[];
  buttonText: string;
  buttonType: "primary" | "secondary" | "danger";
}

interface FriendsTabData {
  friends: Friend[];
  pendingRequests?: PendingRequest[];
  mutualFriends?: Friend[];
  friendshipAction?: FriendshipAction;
  friendsCount: number;
  pendingCount?: number;
  mutualFriendsCount?: number;
  showLimitedFriends?: boolean;
  maxDisplayFriends?: number;
  hasMoreFriends: boolean;
  tabType: string;
  currentPage: number;
  pageSize: number;
  isOwnProfile: boolean;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [activeTab, setActiveTab] = useState<"friends" | "pending">("friends");
  const [loading, setLoading] = useState(false);
  const [friendsData, setFriendsData] = useState<FriendsTabData | null>(null);

  // Determine if viewing own profile or someone else's
  const isOwnProfile = !params.id || params.id === 'me' || params.id === user?.id;
  const username = isOwnProfile ? 'me' : params.id as string;

  // Load friends data from API
  const loadFriendsData = async (page = 0) => {
    setLoading(true);
    try {
      const endpoint = isOwnProfile
        ? `/api/user-profiles/me/tabs/friends?page=${page}&size=20`
        : `/api/user-profiles/profile/${username}/tabs/friends?page=${page}&size=6`;

      // Real API call
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('Friends API Response:', apiData); // Debug log

      // Transform API response to match our interface
      const transformedData: FriendsTabData = {
        friends: (apiData.friends || []).map((friend: any) => ({
          id: friend.id,
          firstName: friend.firstName,
          lastName: friend.lastName,
          username: friend.username,
          avatarUrl: friend.avatarUrl || friend.avtUrl || null, // Handle both field names
          department: friend.department,
          jobTitle: friend.jobTitle,
          isPremium: friend.isPremium || false,
          premiumBadgeUrl: friend.premiumBadgeUrl,
          friendshipDate: friend.friendshipDate,
          isOnline: friend.isOnline,
          lastSeen: friend.lastSeen,
          isMutualFriend: friend.isMutualFriend
        })),
        pendingRequests: (apiData.pendingRequests || []).map((request: any) => ({
          id: request.id,
          firstName: request.firstName,
          lastName: request.lastName,
          username: request.username,
          avatarUrl: request.avatarUrl || request.avtUrl || null, // Handle both field names
          department: request.department,
          jobTitle: request.jobTitle,
          isPremium: request.isPremium || false,
          premiumBadgeUrl: request.premiumBadgeUrl,
          requestSentAt: request.requestSentAt,
          requestType: request.requestType,
          canAccept: request.canAccept,
          canReject: request.canReject,
          canCancel: request.canCancel
        })),
        mutualFriends: (apiData.mutualFriends || []).map((friend: any) => ({
          id: friend.id,
          firstName: friend.firstName,
          lastName: friend.lastName,
          username: friend.username,
          avatarUrl: friend.avatarUrl || friend.avtUrl || null, // Handle both field names
          department: friend.department,
          jobTitle: friend.jobTitle,
          isPremium: friend.isPremium || false,
          premiumBadgeUrl: friend.premiumBadgeUrl
        })),
        friendshipAction: apiData.friendshipAction,
        friendsCount: apiData.friendsCount || 0,
        pendingCount: apiData.pendingCount || 0,
        mutualFriendsCount: apiData.mutualFriendsCount || 0,
        showLimitedFriends: apiData.showLimitedFriends || false,
        maxDisplayFriends: apiData.maxDisplayFriends || 6,
        hasMoreFriends: apiData.hasMoreFriends || false,
        tabType: apiData.tabType || "friends",
        currentPage: apiData.currentPage || 0,
        pageSize: apiData.pageSize || (isOwnProfile ? 20 : 6),
        isOwnProfile: apiData.isOwnProfile !== undefined ? apiData.isOwnProfile : isOwnProfile
      };

      setFriendsData(transformedData);
    } catch (error) {
      console.error("Error loading friends data:", error);

      // Create fallback friends data
      const fallbackData: FriendsTabData = {
        friends: [],
        pendingRequests: [],
        mutualFriends: [],
        friendshipAction: isOwnProfile ? undefined : {
          currentStatus: "NOT_FRIENDS",
          availableActions: ["SEND_FRIEND_REQUEST"],
          buttonText: "Add Friend",
          buttonType: "primary"
        },
        friendsCount: 0,
        pendingCount: 0,
        mutualFriendsCount: 0,
        showLimitedFriends: !isOwnProfile,
        maxDisplayFriends: isOwnProfile ? 20 : 6,
        hasMoreFriends: false,
        tabType: "friends",
        currentPage: 0,
        pageSize: isOwnProfile ? 20 : 6,
        isOwnProfile: isOwnProfile
      };

      setFriendsData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, [isOwnProfile, username]);

  // Filter friends based on search and status
  const filteredFriends = useMemo(() => {
    if (!friendsData) return [];

    return friendsData.friends.filter(friend => {
      const fullName = `${friend.firstName} ${friend.lastName}`;
      const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           friend.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "all" ||
                           (filter === "online" && friend.isOnline) ||
                           (filter === "offline" && !friend.isOnline);
      return matchesSearch && matchesFilter;
    });
  }, [friendsData, searchQuery, filter]);

  // Friend action handlers using correct API endpoints
  const handleSendFriendRequest = async (targetUserId: number) => {
    setLoading(true);
    try {
      // API call: POST /api/friends/request
      console.log("Sending friend request to:", targetUserId);
      // Update friendship action
      if (friendsData?.friendshipAction) {
        setFriendsData({
          ...friendsData,
          friendshipAction: {
            currentStatus: "PENDING_SENT",
            availableActions: ["CANCEL_FRIEND_REQUEST"],
            buttonText: "Cancel Request",
            buttonType: "secondary"
          }
        });
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    setLoading(true);
    try {
      // API call: POST /api/friends/accept/{requestId}
      console.log("Accepting friend request:", requestId);

      // Remove from pending requests and update data
      if (friendsData) {
        const updatedPendingRequests = friendsData.pendingRequests?.filter(req => req.id !== requestId) || [];
        setFriendsData({
          ...friendsData,
          pendingRequests: updatedPendingRequests,
          pendingCount: (friendsData.pendingCount || 1) - 1,
          friendsCount: friendsData.friendsCount + 1
        });
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setLoading(true);
    try {
      // API call: POST /api/friends/reject/{requestId}
      console.log("Rejecting friend request:", requestId);

      // Remove from pending requests
      if (friendsData) {
        const updatedPendingRequests = friendsData.pendingRequests?.filter(req => req.id !== requestId) || [];
        setFriendsData({
          ...friendsData,
          pendingRequests: updatedPendingRequests,
          pendingCount: (friendsData.pendingCount || 1) - 1
        });
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    setLoading(true);
    try {
      // API call: DELETE /api/friends/cancel/{requestId}
      console.log("Cancelling friend request:", requestId);

      // Remove from pending requests or update friendship action
      if (friendsData) {
        if (friendsData.isOwnProfile) {
          const updatedPendingRequests = friendsData.pendingRequests?.filter(req => req.id !== requestId) || [];
          setFriendsData({
            ...friendsData,
            pendingRequests: updatedPendingRequests,
            pendingCount: (friendsData.pendingCount || 1) - 1
          });
        } else if (friendsData.friendshipAction) {
          setFriendsData({
            ...friendsData,
            friendshipAction: {
              currentStatus: "NOT_FRIENDS",
              availableActions: ["SEND_FRIEND_REQUEST"],
              buttonText: "Add Friend",
              buttonType: "primary"
            }
          });
        }
      }
    } catch (error) {
      console.error("Error cancelling friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (userId: number) => {
    setLoading(true);
    try {
      // API call: DELETE /api/friends/unfriend/{userId}
      console.log("Unfriending user:", userId);

      // Remove from friends list
      if (friendsData) {
        const updatedFriends = friendsData.friends.filter(friend => friend.id !== userId);
        setFriendsData({
          ...friendsData,
          friends: updatedFriends,
          friendsCount: friendsData.friendsCount - 1
        });
      }
    } catch (error) {
      console.error("Error unfriending user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render relationship action button for other user's profile
  const renderRelationshipButton = () => {
    if (isOwnProfile || !friendsData?.friendshipAction) return null;

    const action = friendsData.friendshipAction;
    const buttonProps = {
      size: "sm" as const,
      disabled: loading,
      className: "transition-all duration-200"
    };

    if (action.availableActions.length === 0) {
      return (
        <span className="text-gray-400 text-sm">{action.buttonText}</span>
      );
    }

    if (action.availableActions.includes("SEND_FRIEND_REQUEST")) {
      return (
        <Button
          {...buttonProps}
          variant="primary"
          onClick={() => handleSendFriendRequest(parseInt(username))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {action.buttonText}
        </Button>
      );
    }

    if (action.availableActions.includes("CANCEL_FRIEND_REQUEST")) {
      return (
        <Button
          {...buttonProps}
          variant="ghost"
          onClick={() => handleCancelRequest(0)} // Request ID would come from API
          className="border border-gray-600 hover:bg-gray-700"
        >
          <Clock className="w-4 h-4 mr-2" />
          {action.buttonText}
        </Button>
      );
    }

    if (action.availableActions.includes("ACCEPT_FRIEND_REQUEST")) {
      return (
        <div className="flex gap-2">
          <Button
            {...buttonProps}
            variant="primary"
            onClick={() => handleAcceptRequest(0)} // Request ID would come from API
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button
            {...buttonProps}
            variant="ghost"
            onClick={() => handleRejectRequest(0)} // Request ID would come from API
            className="border border-gray-600 hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      );
    }

    if (action.availableActions.includes("UNFRIEND")) {
      return (
        <Button
          {...buttonProps}
          variant="ghost"
          onClick={() => handleUnfriend(parseInt(username))}
          className="border border-red-600 text-red-400 hover:bg-red-600/10"
        >
          <UserMinus className="w-4 h-4 mr-2" />
          {action.buttonText}
        </Button>
      );
    }

    return null;
  };

  if (!friendsData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: DARK_THEME.text.primary }}>
            {isOwnProfile ? "My Friends" : "Friends"}
          </h1>
          {renderRelationshipButton()}
        </div>

        {/* Privacy Notice for Other User's Profile */}
        {!isOwnProfile && friendsData.showLimitedFriends && (
          <div
            className="mb-4 p-3 rounded-lg border flex items-center gap-2"
            style={{
              backgroundColor: DARK_THEME.background.secondary,
              borderColor: DARK_THEME.border.default,
              color: DARK_THEME.text.secondary
            }}
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm">
              Only showing {friendsData.maxDisplayFriends} friends. {friendsData.mutualFriendsCount} mutual friends.
            </span>
          </div>
        )}

        {/* Search and Filter - Only for own profile */}
        {isOwnProfile && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-0 text-white placeholder-gray-400"
                style={{
                  backgroundColor: DARK_THEME.background.secondary,
                  borderColor: DARK_THEME.border.default
                }}
              />
            </div>

            <div className="flex gap-2">
              {["all", "online", "offline"].map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(filterOption as typeof filter)}
                  className={filter === filterOption ? "bg-blue-600" : ""}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs - Only for own profile */}
        {isOwnProfile && (
          <div className="flex gap-1 mb-6">
            <Button
              variant={activeTab === "friends" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("friends")}
              className={activeTab === "friends" ? "bg-blue-600" : ""}
            >
              <Users className="w-4 h-4 mr-2" />
              Friends ({friendsData.friendsCount})
            </Button>
            <Button
              variant={activeTab === "pending" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("pending")}
              className={activeTab === "pending" ? "bg-blue-600" : ""}
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending ({friendsData.pendingCount || 0})
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: DARK_THEME.text.primary }}>
              {friendsData.friendsCount}
            </div>
            <div className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
              {isOwnProfile ? 'Total Friends' : 'Friends'}
            </div>
          </div>
          {isOwnProfile && (
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: DARK_THEME.text.primary }}>
                {friendsData.pendingCount || 0}
              </div>
              <div className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                Pending Requests
              </div>
            </div>
          )}
          {!isOwnProfile && friendsData.mutualFriendsCount && friendsData.mutualFriendsCount > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: DARK_THEME.text.primary }}>
                {friendsData.mutualFriendsCount}
              </div>
              <div className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                Mutual Friends
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Friends List */}
        {(activeTab === "friends" || !isOwnProfile) && (
          <div>
            {filteredFriends.length === 0 ? (
              <div
                className="text-center py-12 rounded-lg"
                style={{ backgroundColor: DARK_THEME.background.secondary }}
              >
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2" style={{ color: DARK_THEME.text.primary }}>
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </h3>
                <p style={{ color: DARK_THEME.text.secondary }}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Start connecting with colleagues and friends'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-4 rounded-lg border transition-all duration-200 hover:shadow-lg group"
                    style={{
                      backgroundColor: DARK_THEME.background.secondary,
                      borderColor: DARK_THEME.border.default
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <UserAvatar
                          name={`${friend.firstName} ${friend.lastName}`}
                          avatar={friend.avatarUrl}
                          size="md"
                          variant="circle"
                        />
                        {friend.isOnline !== undefined && (
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${
                              friend.isOnline ? "bg-green-500" : "bg-gray-500"
                            }`}
                            style={{ borderColor: DARK_THEME.background.secondary }}
                          />
                        )}
                        {friend.isPremium && friend.premiumBadgeUrl && (
                          <img
                            src={friend.premiumBadgeUrl}
                            alt="Premium"
                            className="absolute -top-1 -right-1 w-4 h-4"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <h3
                            className="font-medium truncate"
                            style={{ color: DARK_THEME.text.primary }}
                          >
                            {friend.firstName} {friend.lastName}
                          </h3>
                          {friend.isPremium && (
                            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        {friend.jobTitle && (
                          <p
                            className="text-sm truncate mb-2"
                            style={{ color: DARK_THEME.text.secondary }}
                          >
                            {friend.jobTitle}{friend.department && ` • ${friend.department}`}
                          </p>
                        )}

                        {friend.isMutualFriend && (
                          <p
                            className="text-xs text-blue-400"
                          >
                            Mutual Friend
                          </p>
                        )}
                      </div>

                      {isOwnProfile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnfriend(friend.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* See All Button for Other User's Profile */}
            {!isOwnProfile && friendsData.hasMoreFriends && (
              <div className="text-center mt-6">
                <Button
                  variant="ghost"
                  onClick={() => console.log("See all friends")}
                  className="border border-gray-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  See All {friendsData.friendsCount} Friends
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mutual Friends Section for Other User's Profile */}
        {!isOwnProfile && friendsData.mutualFriends && friendsData.mutualFriends.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: DARK_THEME.text.primary }}>
              Mutual Friends ({friendsData.mutualFriendsCount})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendsData.mutualFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-4 rounded-lg border transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: DARK_THEME.background.secondary,
                    borderColor: DARK_THEME.border.default
                  }}
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={`${friend.firstName} ${friend.lastName}`}
                      avatar={friend.avatarUrl}
                      size="md"
                      variant="circle"
                    />

                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium truncate"
                        style={{ color: DARK_THEME.text.primary }}
                      >
                        {friend.firstName} {friend.lastName}
                      </h3>
                      {friend.jobTitle && (
                        <p
                          className="text-sm truncate"
                          style={{ color: DARK_THEME.text.secondary }}
                        >
                          {friend.jobTitle}{friend.department && ` • ${friend.department}`}
                        </p>
                      )}
                      <p className="text-xs text-blue-400">
                        Mutual Friend
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests - Only for own profile */}
        {isOwnProfile && activeTab === "pending" && (
          <div>
            {!friendsData.pendingRequests || friendsData.pendingRequests.length === 0 ? (
              <div
                className="text-center py-12 rounded-lg"
                style={{ backgroundColor: DARK_THEME.background.secondary }}
              >
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2" style={{ color: DARK_THEME.text.primary }}>
                  No pending requests
                </h3>
                <p style={{ color: DARK_THEME.text.secondary }}>
                  Friend requests will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {friendsData.pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border flex items-center justify-between"
                    style={{
                      backgroundColor: DARK_THEME.background.secondary,
                      borderColor: DARK_THEME.border.default
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserAvatar
                          name={`${request.firstName} ${request.lastName}`}
                          avatar={request.avatarUrl}
                          size="md"
                          variant="circle"
                        />
                        {request.isPremium && request.premiumBadgeUrl && (
                          <img
                            src={request.premiumBadgeUrl}
                            alt="Premium"
                            className="absolute -top-1 -right-1 w-4 h-4"
                          />
                        )}
                      </div>

                      <div>
                        <h3
                          className="font-medium"
                          style={{ color: DARK_THEME.text.primary }}
                        >
                          {request.firstName} {request.lastName}
                        </h3>
                        {request.jobTitle && (
                          <p
                            className="text-sm"
                            style={{ color: DARK_THEME.text.secondary }}
                          >
                            {request.jobTitle}{request.department && ` • ${request.department}`}
                          </p>
                        )}
                        <p
                          className="text-xs"
                          style={{ color: DARK_THEME.text.muted }}
                        >
                          {request.requestType === "RECEIVED" ? "Sent you a friend request" : "You sent a friend request"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {request.requestType === "RECEIVED" ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectRequest(request.id)}
                            className="border border-gray-600"
                            disabled={loading}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelRequest(request.id)}
                          className="border border-gray-600"
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
