"use client";

import React, { memo, useRef, useCallback, useMemo } from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import { ChatMessage, ChatUser, ReactionType } from '@/types/chat';
import MessageItem from './MessageItem';

// Date Separator component
const DateSeparator = memo(({ date }: { date: Date }) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let dateText: string;

  if (date.toDateString() === today.toDateString()) {
    dateText = 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    dateText = 'Yesterday';
  } else {
    dateText = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  return (
    <div className="flex items-center justify-center my-4">
      <div
        className="px-4 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: DARK_THEME.background.muted,
          color: DARK_THEME.text.muted
        }}
      >
        {dateText}
      </div>
    </div>
  );
});

DateSeparator.displayName = 'DateSeparator';

// Typing Indicator component
const TypingIndicator = memo(({ typingUsers }: { typingUsers: string[] }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3">
      <div className="flex gap-1">
        {[0, 150, 300].map((delay, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: DARK_THEME.text.muted,
              animationDelay: `${delay}ms`
            }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: DARK_THEME.text.muted }}>
        {typingUsers.length === 1
          ? `${typingUsers[0]} is typing...`
          : `${typingUsers.length} people are typing...`
        }
      </span>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

interface ChatMessagesProps {
  messages: ChatMessage[];
  typingUsers: string[];
  currentUser?: ChatUser;
  showScrollToBottom: boolean;
  onToggleReaction: (messageId: number, reactionType: ReactionType) => void;
  onReply: (message: ChatMessage) => void;
  onScrollToBottom: () => void;
  onScroll: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  typingUsers,
  currentUser,
  showScrollToBottom,
  onToggleReaction,
  onReply,
  onScrollToBottom,
  onScroll,
  messagesEndRef,
  messagesContainerRef
}) => {
  // Fix duplicate keys issue and optimize message rendering
  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter(message => {
      if (seen.has(message.id)) {
        return false;
      }
      seen.add(message.id);
      return true;
    });
  }, [messages]);

  const renderedMessages = useMemo(() => {
    if (uniqueMessages.length === 0) return [];

    // Sort messages by date (oldest first)
    const sortedMessages = [...uniqueMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const result: React.ReactNode[] = [];
    let lastMessageDate: string | null = null;

    // Process each message and add date separators when the date changes
    sortedMessages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      const messageDateString = messageDate.toDateString();

      // If date has changed, add a separator
      if (lastMessageDate !== messageDateString) {
        result.push(
          <DateSeparator
            key={`date-${messageDateString}`}
            date={messageDate}
          />
        );
        lastMessageDate = messageDateString;
      }

      // Add the message
      const isOwn = message.senderId === currentUser?.id;
      const showAvatar = true;

      result.push(
        <MessageItem
          key={`msg-${message.id}-${message.createdAt}`}
          message={message}
          isOwn={isOwn}
          showAvatar={showAvatar}
          currentUserId={currentUser?.id}
          onToggleReaction={onToggleReaction}
          onReply={onReply}
        />
      );
    });

    return result;
  }, [uniqueMessages, currentUser?.id, onToggleReaction, onReply]);

  return (
    <div className="flex-1 relative">
      <div
        ref={messagesContainerRef}
        className="absolute inset-0 overflow-y-auto p-4"
        onScroll={onScroll}
      >
        {uniqueMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-full">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${THEME_COLORS.info[500]}20` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: THEME_COLORS.info[500] }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p style={{ color: DARK_THEME.text.muted }} className="text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {renderedMessages}
            <TypingIndicator typingUsers={typingUsers} />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <button
          onClick={onScrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: THEME_COLORS.primary[500],
            color: '#ffffff'
          }}
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatMessages;
