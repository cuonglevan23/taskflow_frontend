// Message List Component - Updated for New Layout
'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { ChatMessage, User } from '@/types/chat';
import { DARK_THEME } from '@/constants/theme';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: User;
  conversationId: number;
  isGroupChat?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
  className?: string;
}

function MessageList({
  messages,
  currentUser,
  conversationId,
  isGroupChat = false,
  onLoadMore,
  loading = false,
  className = ''
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(messages.length);

  // Sort messages by timestamp (oldest first, newest last)
  const sortedMessages = useMemo(() => {
    const sorted = [...messages].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB; // Oldest first, newest last
    });

    return sorted;
  }, [messages, conversationId]);

  // Group messages by date for better organization
  const messagesByDate = useMemo(() => {
    const groups: { [date: string]: ChatMessage[] } = {};

    sortedMessages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  }, [sortedMessages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    const currentLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;

    if (currentLength > prevLength) {
      setTimeout(scrollToBottom, 100);
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (sortedMessages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [conversationId]);

  // Handle scroll for loading more messages
  const handleScroll = () => {
    if (!messagesContainerRef.current || !onLoadMore) return;

    const { scrollTop } = messagesContainerRef.current;

    // Load more when scrolled near the top
    if (scrollTop < 100 && !loading) {
      onLoadMore();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Check if should show avatar (avoid consecutive messages from same sender)
  const shouldShowAvatar = (message: ChatMessage, index: number, dayMessages: ChatMessage[]) => {
    if (index === dayMessages.length - 1) return true; // Last message always shows avatar

    const nextMessage = dayMessages[index + 1];
    if (!nextMessage) return true;

    // Show avatar if next message is from different sender
    return message.senderId !== nextMessage.senderId;
  };

  if (sortedMessages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 ${className}`} style={{ color: DARK_THEME.text.muted }}>
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
          <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${className}`} style={{ backgroundColor: DARK_THEME.background.primary }}>
      {/* Loading indicator at top */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: DARK_THEME.text.muted }}>
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: DARK_THEME.border.focus }}
            ></div>
            Đang tải...
          </div>
        </div>
      )}

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        onScroll={handleScroll}
        style={{
          scrollBehavior: 'smooth',
          backgroundColor: DARK_THEME.background.primary
        }}
      >
        {Object.entries(messagesByDate).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator - Dark Theme */}
            <div className="flex justify-center my-4">
              <div
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  backgroundColor: DARK_THEME.background.secondary,
                  color: DARK_THEME.text.secondary
                }}
              >
                {formatDate(date)}
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUser={currentUser}
                showAvatar={shouldShowAvatar(message, index, dayMessages)}
                showTimestamp={true}
                isGroupChat={isGroupChat}
              />
            ))}
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default MessageList;
