"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import Button from "@/components/ui/Button/Button";
import { useFriendsList, FriendData } from '@/hooks/profile/useFriendsList';
import { useChatContext } from '@/contexts/ChatContext';
import { DARK_THEME } from '@/constants/theme';
interface FriendListProps {
  className?: string;
}

interface FriendItemProps {
  friend: FriendData;
}

function FriendItem({ friend }: FriendItemProps) {
  const { openChatWindow } = useChatContext();

  const handleMessageClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔍 FriendItem: handleMessageClick called');
    console.log('🔍 FriendItem: friend data:', friend);

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
      console.log('✅ FriendItem: openChatWindow called successfully');
    } catch (error) {
      console.error('❌ FriendItem: Error opening chat:', error);
    }
  };

  const fullName = `${friend.firstName} ${friend.lastName}`;
  const isOnline = friend.isOnline;

  return (
    <div
      className="flex items-center justify-between p-2 rounded-lg transition-colors group"
      style={{
        backgroundColor: 'transparent',
        '--hover-bg': DARK_THEME.background.weakHover,
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="relative">
          <UserAvatar
            name={fullName}
            avatar={friend.avatarUrl}
            size="sm"
          />
          {isOnline && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: '#22c55e', // Green for online
                borderColor: DARK_THEME.background.primary,
              }}
            ></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: DARK_THEME.text.primary }}
          >
            {fullName}
          </p>
          {friend.department && (
            <p
              className="text-xs truncate"
              style={{ color: DARK_THEME.text.muted }}
            >
              {friend.department}
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="px-3 py-2 transition-all duration-200 rounded-lg border border-transparent"
          style={{
            color: DARK_THEME.text.muted,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            '--hover-color': '#3b82f6',
            '--hover-bg': 'rgba(59, 130, 246, 0.1)',
            '--hover-border': 'rgba(59, 130, 246, 0.2)',
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--hover-color)';
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            e.currentTarget.style.borderColor = 'var(--hover-border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = DARK_THEME.text.muted;
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onClick={handleMessageClick}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Chat</span>
        </Button>
      </div>
    </div>
  );
}

function FriendList({ className = "" }: FriendListProps) {
  const {
    friends,
    friendsCount,
    onlineFriendsCount,
    offlineFriendsCount,
    loading,
    error,
    getOnlineFriends,
    getOfflineFriends
  } = useFriendsList();

  // Lấy danh sách bạn bè online và offline
  const onlineFriends = getOnlineFriends();
  const offlineFriends = getOfflineFriends();

  if (loading) {
    return (
      <div
        className={`rounded-lg border p-4 ${className}`}
        style={{
          backgroundColor: DARK_THEME.background.secondary,
          borderColor: DARK_THEME.border.default,
        }}
      >
        <div className="flex items-center justify-center py-8">
          <div
            className="animate-spin rounded-full h-6 w-6 border-b-2"
            style={{ borderBottomColor: '#3b82f6' }}
          ></div>
          <span
            className="ml-2"
            style={{ color: DARK_THEME.text.muted }}
          >
            Đang tải...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-lg border p-4 ${className}`}
        style={{
          backgroundColor: DARK_THEME.background.secondary,
          borderColor: DARK_THEME.border.default,
        }}
      >
        <div className="text-center py-8">
          <p
            className="text-sm"
            style={{ color: DARK_THEME.status.error }}
          >
            Không thể tải danh sách bạn bè
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: DARK_THEME.text.muted }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (friendsCount === 0) {
    return (
      <div
        className={`rounded-lg border p-4 ${className}`}
        style={{
          backgroundColor: DARK_THEME.background.secondary,
          borderColor: DARK_THEME.border.default,
        }}
      >
        <div className="text-center py-8">
          <MessageCircle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: DARK_THEME.text.muted }}
          />
          <p
            className="text-sm"
            style={{ color: DARK_THEME.text.muted }}
          >
            Chưa có bạn bè nào
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: DARK_THEME.text.muted }}
          >
            Hãy kết bạn để bắt đầu trò chuyện!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-4 ${className}`}
      style={{
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: DARK_THEME.text.primary }}
        >
          Bạn bè
        </h3>
        <span
          className="text-sm"
          style={{ color: DARK_THEME.text.muted }}
        >
          {onlineFriendsCount} đang hoạt động
        </span>
      </div>

      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <div className="mb-6">
          <h4
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: DARK_THEME.text.secondary }}
          >
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: '#22c55e' }}
            ></div>
            Đang hoạt động ({onlineFriends.length})
          </h4>
          <div className="space-y-1">
            {onlineFriends.map((friend) => (
              <FriendItem key={friend.userId} friend={friend} />
            ))}
          </div>
        </div>
      )}

      {/* Offline Friends */}
      {offlineFriends.length > 0 && (
        <div>
          <h4
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: DARK_THEME.text.secondary }}
          >
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: DARK_THEME.text.muted }}
            ></div>
            Không hoạt động ({offlineFriends.length})
          </h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {offlineFriends.map((friend) => (
              <FriendItem key={friend.userId} friend={friend} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendList;
