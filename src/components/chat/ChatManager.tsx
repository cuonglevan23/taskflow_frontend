'use client';

import React from 'react';
import { MiniChatWindow } from './MiniChatWindow';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChatMessage, ChatWindow } from '@/types/chat';
import { DARK_THEME } from '@/constants/theme';

interface ChatManagerProps {
  className?: string;
}

export function ChatManager({ className = '' }: ChatManagerProps) {
  const {
    openWindows,
    messages,
    typingUsers,
    closeChatWindow,
    toggleMinimize,
    sendMessage,
    setTyping,
    loadMessages  // Add loadMessages to ensure messages are loaded
  } = useChatContext();

  // Get current user from Auth with proper typing
  const { user } = useAuth();

  // Convert user ID from string to number with explicit typing
  const currentUserId: number | undefined = user?.id ? parseInt(user.id, 10) : undefined;

  // Load messages for all open windows when they open
  React.useEffect(() => {
    openWindows.forEach(chatWindow => {
      if (chatWindow.conversationId && chatWindow.conversationId > 0) {
        // Check if messages are already loaded for this conversation
        const existingMessages = messages.get(chatWindow.conversationId);
        if (!existingMessages || existingMessages.length === 0) {
          console.log(`Loading messages for conversation ${chatWindow.conversationId}`);
          loadMessages(chatWindow.conversationId);
        }
      }
    });
  }, [openWindows, loadMessages, messages]);

  if (openWindows.length === 0) {
    return null;
  }

  return (
    <>
      {openWindows.map((chatWindow: ChatWindow, index: number) => {
        // Better message retrieval with logging
        const conversationId = chatWindow.conversationId;
        const conversationMessages: ChatMessage[] = conversationId ?
          (messages.get(conversationId) || []) : [];

        // Debug logging
        console.log('ChatManager - Window Messages:', {
          windowKey: chatWindow.key,
          conversationId: conversationId,
          messagesCount: conversationMessages.length,
          userName: `${chatWindow.user.firstName} ${chatWindow.user.lastName}`,
          messages: conversationMessages.slice(0, 2) // Log first 2 messages
        });

        // Use isOnline directly from chatWindow.user instead of onlineUsers map
        const isOnline: boolean = chatWindow.user.isOnline || false;
        const typingInConversation: string[] = conversationId ?
          (typingUsers.get(conversationId)?.map(t => t.userName) || []) : [];

        // SIMPLIFIED: Better positioning logic - stack windows from bottom-right
        const windowWidth = chatWindow.isMinimized ? 256 : 350;
        const windowSpacing = 20;

        // Calculate position based on window index
        const rightOffset = windowSpacing + (index * (windowWidth + windowSpacing));

        // Define handler functions with explicit types
        const handleClose = (): void => closeChatWindow(chatWindow.key);
        const handleMinimize = (): void => toggleMinimize(chatWindow.key);
        const handleSendMessage = (content: string): void => {
          if (conversationId) {
            sendMessage(conversationId, content);
          }
        };
        const handleTyping = (isTyping: boolean): void => {
          if (conversationId) {
            setTyping(conversationId, isTyping);
          }
        };

        return (
          <div
            key={chatWindow.key}
            data-window-id={chatWindow.key}
            className="fixed"
            style={{
              bottom: 0,
              right: `${rightOffset}px`,
              zIndex: Math.max(10000, chatWindow.zIndex || 10000),
            }}
          >
            <MiniChatWindow
              window={chatWindow}
              messages={conversationMessages}
              isOnline={isOnline}
              typingUsers={typingInConversation}
              onClose={handleClose}
              onMinimize={handleMinimize}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
            />
          </div>
        );
      })}
    </>
  );
}

export default ChatManager;
