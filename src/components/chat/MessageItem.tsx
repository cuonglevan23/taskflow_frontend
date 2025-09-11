// Message Item Component - Updated Layout
'use client';

import React from 'react';
import { ChatMessage, User } from '@/types/chat';
import { DARK_THEME } from '@/constants/theme';
import Image from 'next/image';

interface MessageItemProps {
  message: ChatMessage;
  currentUser: User;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  isGroupChat?: boolean;
}

function MessageItem({
  message,
  currentUser,
  showAvatar = true,
  showTimestamp = false,
  isGroupChat = false
}: MessageItemProps) {
  const isOwnMessage: boolean = message.senderId === currentUser.id;

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get sender info from message properties
  const senderName = message.senderName || 'Unknown User';
  const senderAvatar = message.senderAvatar || '/images/placeholders/avatar-placeholder.png';

  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-start' : 'justify-end'}`}>
      {/* Layout for own messages (left side) */}
      {isOwnMessage ? (
        <div className="flex items-end gap-2 max-w-[70%]">
          {/* Message content */}
          <div className="flex flex-col">
            {/* Sender name for group chat */}
            {isGroupChat && (
              <span className="text-xs mb-1 ml-3" style={{ color: DARK_THEME.text.secondary }}>
                Bạn
              </span>
            )}

            {/* Message bubble - Dark Theme */}
            <div
              className="rounded-2xl rounded-bl-md px-4 py-2 shadow-sm"
              style={{
                backgroundColor: DARK_THEME.background.tertiary,
                color: DARK_THEME.text.primary
              }}
            >
              <p className="text-sm leading-relaxed break-words">
                {message.content}
              </p>
            </div>

            {/* Timestamp */}
            {showTimestamp && (
              <span className="text-xs mt-1 ml-3" style={{ color: DARK_THEME.text.muted }}>
                {formatTime(message.createdAt)}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Layout for other messages (right side) */
        <div className="flex items-end gap-2 max-w-[70%]">
          {/* Avatar for other users */}
          {showAvatar && (
            <div className="flex-shrink-0">
              <Image
                src={senderAvatar}
                alt={senderName}
                width={32}
                height={32}
                className="rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholders/avatar-placeholder.png';
                }}
              />
            </div>
          )}

          {/* Message content */}
          <div className="flex flex-col">
            {/* Sender name for group chat */}
            {isGroupChat && (
              <span className="text-xs mb-1 mr-3 text-right" style={{ color: DARK_THEME.text.secondary }}>
                {senderName}
              </span>
            )}

            {/* Message bubble - Dark Theme */}
            <div
              className="rounded-2xl rounded-br-md px-4 py-2 shadow-sm"
              style={{
                backgroundColor: DARK_THEME.background.secondary,
                color: DARK_THEME.text.primary
              }}
            >
              <p className="text-sm leading-relaxed break-words">
                {message.content}
              </p>
            </div>

            {/* Timestamp */}
            {showTimestamp && (
              <span className="text-xs mt-1 mr-3 text-right" style={{ color: DARK_THEME.text.muted }}>
                {formatTime(message.createdAt)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
