"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import Button from "@/components/ui/Button/Button";
import { useFriendsList, FriendData } from '@/hooks/profile/useFriendsList';
import { useChatContext } from '@/contexts/ChatContext';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface FriendListProps {
  className?: string;
}

interface FriendItemProps {
  friend: FriendData;
  t: (key: string) => string;
  themeClasses: any;
}

function FriendItem({ friend, t, themeClasses }: FriendItemProps) {
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
      className={`flex items-center justify-between p-2 rounded-lg transition-colors group ${themeClasses.hover}`}
      style={{
        backgroundColor: 'transparent',
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
                borderColor: themeClasses.background.primary,
              }}
            ></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${themeClasses.text.primary}`}>
            {fullName}
          </p>
          {friend.department && (
            <p className={`text-xs truncate ${themeClasses.text.muted}`}>
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
          className={`px-3 py-2 transition-all duration-200 rounded-lg border border-transparent ${themeClasses.text.muted} hover:text-blue-500 hover:bg-blue-100 hover:border-blue-200`}
          onClick={handleMessageClick}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{t('friendList.actions.chat')}</span>
        </Button>
      </div>
    </div>
  );
}

function FriendList({ className = "" }: FriendListProps) {
  const { theme, themeMode } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // Dynamic theme-based classes
  const getThemeClasses = () => {
    const isDark = themeMode === 'dark';
    return {
      container: {
        background: isDark ? 'bg-gray-800' : 'bg-white',
        border: isDark ? 'border-gray-700' : 'border-gray-200'
      },
      text: {
        primary: isDark ? 'text-white' : 'text-gray-900',
        secondary: isDark ? 'text-gray-300' : 'text-gray-700',
        muted: isDark ? 'text-gray-400' : 'text-gray-500',
        error: isDark ? 'text-red-400' : 'text-red-600'
      },
      background: {
        primary: isDark ? '#1f2937' : '#ffffff',
        secondary: isDark ? '#374151' : '#f9fafb'
      },
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
      spinner: isDark ? '#3b82f6' : '#2563eb'
    };
  };

  const themeClasses = getThemeClasses();

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

  // Get online and offline friends lists
  const onlineFriends = getOnlineFriends();
  const offlineFriends = getOfflineFriends();

  if (loading) {
    return (
      <div className={`rounded-lg border p-4 ${className} ${themeClasses.container.background} ${themeClasses.container.border}`}>
        <div className="flex items-center justify-center py-8">
          <div
            className="animate-spin rounded-full h-6 w-6 border-b-2"
            style={{ borderBottomColor: themeClasses.spinner }}
          ></div>
          <span className={`ml-2 ${themeClasses.text.muted}`}>
            {t('friendList.loading')}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border p-4 ${className} ${themeClasses.container.background} ${themeClasses.container.border}`}>
        <div className="text-center py-8">
          <p className={`text-sm ${themeClasses.text.error}`}>
            {t('friendList.error.cannotLoad')}
          </p>
          <p className={`text-xs mt-1 ${themeClasses.text.muted}`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (friendsCount === 0) {
    return (
      <div className={`rounded-lg border p-4 ${className} ${themeClasses.container.background} ${themeClasses.container.border}`}>
        <div className="text-center py-8">
          <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${themeClasses.text.muted}`} />
          <p className={`text-sm ${themeClasses.text.muted}`}>
            {t('friendList.empty.noFriends')}
          </p>
          <p className={`text-xs mt-1 ${themeClasses.text.muted}`}>
            {t('friendList.empty.encouragement')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${className} ${themeClasses.container.background} ${themeClasses.container.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
          {t('friendList.title')}
        </h3>
        <span className={`text-sm ${themeClasses.text.muted}`}>
          {t('friendList.sections.activeCount').replace('{count}', onlineFriendsCount.toString())}
        </span>
      </div>

      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <div className="mb-6">
          <h4 className={`text-sm font-medium mb-2 flex items-center ${themeClasses.text.secondary}`}>
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: '#22c55e' }}
            ></div>
            {t('friendList.sections.onlineCount').replace('{count}', onlineFriends.length.toString())}
          </h4>
          <div className="space-y-1">
            {onlineFriends.map((friend) => (
              <FriendItem
                key={friend.userId}
                friend={friend}
                t={t}
                themeClasses={themeClasses}
              />
            ))}
          </div>
        </div>
      )}

      {/* Offline Friends */}
      {offlineFriends.length > 0 && (
        <div>
          <h4 className={`text-sm font-medium mb-2 flex items-center ${themeClasses.text.secondary}`}>
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: themeClasses.text.muted }}
            ></div>
            {t('friendList.sections.offlineCount').replace('{count}', offlineFriends.length.toString())}
          </h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {offlineFriends.map((friend) => (
              <FriendItem
                key={friend.userId}
                friend={friend}
                t={t}
                themeClasses={themeClasses}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendList;
