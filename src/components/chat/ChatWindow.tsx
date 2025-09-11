// Complete Chat Window with Sorted Messages and Avatar Display
'use client';

import React, { useState, useEffect } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { DARK_THEME } from '@/constants/theme';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { ChatConversation, User } from '@/types/chat';

interface ChatWindowProps {
  conversation: ChatConversation;
  className?: string;
}

function ChatWindow({ conversation, className = '' }: ChatWindowProps) {
  const {
    messages,
    loadMessages,
    sendMessage,
    setTyping,
    typingUsers,
    isConnected
  } = useChatContext();

  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Create currentUser object for MessageList component with proper typing
  const currentUser: User = user ? {
    id: parseInt(String(user.id)) || 0,  // Better string conversion
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    email: user.email || '',
    avatar: user.avatar || user.avatarUrl || undefined
  } : {
    id: 0,
    name: 'User',
    email: '',
    avatar: undefined
  };

  // Get messages for current conversation with proper sorting
  const conversationMessages = messages.get(conversation.id) || [];
  const conversationTyping = typingUsers.get(conversation.id) || [];

  console.log('ChatWindow - Conversation Messages:', {
    conversationId: conversation.id,
    messagesCount: conversationMessages.length,
    currentUserId: currentUser.id,
    messages: conversationMessages.slice(0, 3) // Log first 3 messages for debugging
  });

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation.id) {
      loadMessages(conversation.id);
    }
  }, [conversation.id, loadMessages]);

  // Handle sending message with proper error typing
  const handleSendMessage = async (content: string, replyToId?: number): Promise<void> => {
    try {
      await sendMessage(conversation.id, content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle loading more messages (pagination) with proper return type
  const handleLoadMore = async (): Promise<void> => {
    if (isLoading || conversationMessages.length === 0) return;

    setIsLoading(true);
    try {
      // For now, we'll just reload all messages since loadMoreMessages isn't available
      await loadMessages(conversation.id);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle typing status with explicit return type
  const handleTypingStart = (): void => {
    setTyping(conversation.id, true);
  };

  const handleTypingStop = (): void => {
    setTyping(conversation.id, false);
  };

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ backgroundColor: DARK_THEME.background.primary }}>
      {/* Chat Header - Dark Theme */}
      <div
        className="flex items-center gap-3 p-4"
        style={{
          borderBottom: `1px solid ${DARK_THEME.border.default}`,
          backgroundColor: DARK_THEME.background.secondary
        }}
      >
        {/* Conversation Avatar */}
        <div className="relative">
          <img
            src={conversation.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name)}&background=random&color=fff&size=40`}
            alt={conversation.name}
            className="w-10 h-10 rounded-full object-cover"
            style={{ borderColor: DARK_THEME.border.default, border: `2px solid ${DARK_THEME.border.default}` }}
          />
          {conversation.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Conversation Info */}
        <div className="flex-1">
          <h3 className="font-semibold" style={{ color: DARK_THEME.text.primary }}>{conversation.name}</h3>
          <div className="flex items-center gap-2 text-sm" style={{ color: DARK_THEME.text.secondary }}>
            {conversation.type === 'GROUP' && (
              <span>{conversation.memberCount} thành viên</span>
            )}
            {conversation.isOnline && (
              <span className="text-green-600">● Đang hoạt động</span>
            )}
          </div>
        </div>

        {/* Unread Count */}
        {conversation.unreadCount > 0 && (
          <div
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: DARK_THEME.background.tertiary,
              color: DARK_THEME.text.primary
            }}
          >
            {conversation.unreadCount}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: DARK_THEME.background.primary }}>
        <MessageList
          messages={conversationMessages}
          currentUser={currentUser}
          conversationId={conversation.id}
          isGroupChat={conversation.type === 'GROUP'}
          onLoadMore={handleLoadMore}
          loading={isLoading}
        />
      </div>

      {/* Typing Indicator */}
      {conversationTyping.length > 0 && (
        <div
          className="px-4 py-2"
          style={{
            borderTop: `1px solid ${DARK_THEME.border.default}`,
            backgroundColor: DARK_THEME.background.secondary
          }}
        >
          <TypingIndicator
            typingUsers={conversationTyping}
            isGroupChat={conversation.type === 'GROUP'}
          />
        </div>
      )}

      {/* Message Input */}
      <div
        style={{
          borderTop: `1px solid ${DARK_THEME.border.default}`,
          backgroundColor: DARK_THEME.background.primary
        }}
      >
        <MessageInput
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          placeholder={`Nhắn tin cho ${conversation.name}...`}
          disabled={!isConnected}
        />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div
          className="px-4 py-2 text-center"
          style={{
            backgroundColor: DARK_THEME.background.muted,
            borderTop: `1px solid ${DARK_THEME.border.default}`
          }}
        >
          <span className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
            🔄 Đang kết nối lại...
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
