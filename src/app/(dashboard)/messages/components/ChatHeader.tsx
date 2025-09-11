"use client";

import React from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import { ChatUser } from '@/types/chat';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

interface ChatHeaderProps {
  conversation: {
    id: number;
    name: string;
    type: 'DIRECT' | 'GROUP';
    participants: ChatUser[];
    avatarUrl?: string;
    isOnline?: boolean;
  };
  currentUser?: ChatUser;
  isConnected: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUser,
  isConnected
}) => {
  // Computed values
  const conversationTitle = conversation.type === 'DIRECT'
    ? conversation.participants.find(p => p.id !== currentUser?.id)?.name || conversation.name
    : conversation.name;

  const otherParticipant = conversation.type === 'DIRECT'
    ? conversation.participants.find(p => p.id !== currentUser?.id)
    : null;

  // Get avatar information
  const getAvatarInfo = () => {
    if (conversation.type === 'DIRECT') {
      const name = conversation.name || conversationTitle;
      const avatarSrc = conversation.avatarUrl;

      const hasParticipants = conversation.participants && conversation.participants.length > 0;
      const participantStatus = hasParticipants && conversation.participants?.[0]?.isOnline
        ? "online"
        : conversation.isOnline
          ? "online"
          : "offline";

      return {
        name,
        avatar: avatarSrc,
        isOnline: participantStatus === "online"
      };
    }
    return null;
  };

  const avatarInfo = getAvatarInfo();

  return (
    <div
      className="flex-shrink-0 p-4 border-b"
      style={{
        backgroundColor: DARK_THEME.header.background,
        borderColor: DARK_THEME.border.default
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {conversation.type === 'GROUP' ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-medium"
              style={{
                backgroundColor: `${THEME_COLORS.info[500]}20`,
                color: THEME_COLORS.info[500]
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ) : (
            <UserAvatar
              name={avatarInfo?.name || conversationTitle}
              avatar={avatarInfo?.avatar}
              size="md"
              status={avatarInfo?.isOnline ? "online" : "offline"}
              showStatus={true}
              variant="circle"
            />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold" style={{ color: DARK_THEME.text.primary }}>
            {conversationTitle}
          </h3>
          {conversation.type === 'DIRECT' && otherParticipant && (
            <p className="text-sm" style={{ color: DARK_THEME.text.muted }}>
              {otherParticipant.isOnline ? 'Online' : 'Offline'}
            </p>
          )}
          {conversation.type === 'GROUP' && (
            <p className="text-sm" style={{ color: DARK_THEME.text.muted }}>
              {conversation.participants.length} members
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isConnected
                ? THEME_COLORS.success[500]
                : THEME_COLORS.error[500]
            }}
          />
          <span
            className="text-xs"
            style={{
              color: isConnected
                ? THEME_COLORS.success[500]
                : THEME_COLORS.error[500]
            }}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
