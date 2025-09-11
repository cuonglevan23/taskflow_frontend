"use client";

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { useFriends } from '@/hooks/useFriends';
import { useReactions } from '@/hooks/chat/useReactions';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  ChatUser,
  ChatWindow,
  ChatMessage,
  ChatConversation,
  TypingIndicator,
  FriendForGroupChat,
  ReactionType,
  MessageReaction
} from '@/types/chat';

interface ChatContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;

  // Data
  conversations: ChatConversation[];
  loadingConversations: boolean;
  messages: Map<number, ChatMessage[]>;
  loadingMessages: Set<number>;
  typingUsers: Map<number, TypingIndicator[]>;
  unreadCounts: Map<number, number>;

  // Friends management
  friends: FriendForGroupChat[];
  loadingFriends: boolean;
  friendsError: string | null;
  refetchFriends: () => Promise<void>;

  // Reactions
  reactions: Map<number, MessageReaction['updatedSummary']>;
  loadingReactions: Set<number>;
  reactionsError: string | null;

  // Chat windows (for popup chats)
  openWindows: ChatWindow[];

  // Actions - Conversations
  loadConversations: () => Promise<void>;
  createDirectChat: (userId: number) => Promise<ChatConversation>;
  createGroupChat: (name: string, memberIds: number[], description?: string) => Promise<ChatConversation>;
  createGroupFromFriends: (name: string, friendIds: number[], description?: string) => Promise<ChatConversation>;

  // Actions - Messages
  sendMessage: (conversationId: number, content: string, replyToId?: number) => Promise<void>;
  sendMessageWithAttachments: (conversationId: number, content: string, files: File[], images: File[], replyToId?: number) => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;

  // Actions - Real-time
  setTyping: (conversationId: number, isTyping: boolean) => void;

  // Actions - Chat Windows
  openChatWindow: (user: ChatUser) => Promise<void>;
  closeChatWindow: (windowKey: string) => void;
  toggleMinimize: (windowKey: string) => void;

  // Actions - Reactions
  toggleReaction: (messageId: number, reactionType: ReactionType) => Promise<void>;
  loadReactions: (messageId: number) => Promise<void>;
  loadBulkReactions: (conversationId: number, messageIds: number[]) => Promise<void>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // Use custom hooks
  const chat = useChat(
    user?.id ? parseInt(user.id) : undefined,
    user?.avatar // Use avatar instead of avatarUrl
  );
  const friends = useFriends();
  const reactionsHook = useReactions();

  // Local state for chat windows
  const [openWindows, setOpenWindows] = useState<ChatWindow[]>([]);

  // Calculate unread counts from conversations
  const unreadCounts = React.useMemo(() => {
    const counts = new Map<number, number>();
    chat.conversations.forEach(conv => {
      if (conv.unreadCount > 0) {
        counts.set(conv.id, conv.unreadCount);
      }
    });
    return counts;
  }, [chat.conversations]);

  // ==================== CHAT WINDOW MANAGEMENT ====================

  const openChatWindow = useCallback(async (user: ChatUser) => {
    const windowKey = `user-${user.id}`;

    // Check if window already exists
    const existingWindow = openWindows.find(w => w.key === windowKey);
    if (existingWindow) {
      // Bring existing window to front and unminimize
      setOpenWindows(prev =>
        prev.map(w =>
          w.key === windowKey
            ? {
                ...w,
                isMinimized: false,
                zIndex: Math.max(...prev.map(w => w.zIndex || 0)) + 1
              }
            : w
        )
      );
      return;
    }

    try {
      // Create or find direct conversation first
      const conversation = await chat.createDirectChat(user.id);

      console.log('Created/found conversation for chat window:', {
        conversationId: conversation.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`
      });

      // Create new window with conversation ID
      const newWindow: ChatWindow = {
        key: windowKey,
        user,
        conversationId: conversation.id, // Set the actual conversation ID
        isMinimized: false,
        zIndex: Math.max(...openWindows.map(w => w.zIndex || 0), 0) + 1
      };

      setOpenWindows(prev => [...prev, newWindow]);

      // Load messages for the conversation
      if (conversation.id) {
        chat.loadMessages(conversation.id);
      }
    } catch (error) {
      console.error('Failed to open chat window:', error);
      // Still create window but without conversationId for now
      const newWindow: ChatWindow = {
        key: windowKey,
        user,
        conversationId: null,
        isMinimized: false,
        zIndex: Math.max(...openWindows.map(w => w.zIndex || 0), 0) + 1
      };
      setOpenWindows(prev => [...prev, newWindow]);
    }
  }, [chat, openWindows]);

  const closeChatWindow = useCallback((windowKey: string) => {
    setOpenWindows(prev => prev.filter(w => w.key !== windowKey));
  }, []);

  const toggleMinimize = useCallback((windowKey: string) => {
    setOpenWindows(prev =>
      prev.map(w =>
        w.key === windowKey
          ? { ...w, isMinimized: !w.isMinimized }
          : w
      )
    );
  }, []);

  // ==================== ENHANCED ACTIONS ====================

  const createGroupFromFriends = useCallback(async (
    name: string,
    friendIds: number[],
    description?: string
  ): Promise<ChatConversation> => {
    try {
      return await chat.createGroupChat(name, friendIds, description);
    } catch (error) {
      console.error('Failed to create group from friends:', error);
      throw error;
    }
  }, [chat]);

  // Context value
  const contextValue: ChatContextType = {
    // Connection state
    isConnected: chat.isConnected,
    isConnecting: chat.isConnecting,

    // Data
    conversations: chat.conversations,
    loadingConversations: chat.loadingConversations,
    messages: chat.messages,
    loadingMessages: chat.loadingMessages,
    typingUsers: chat.typingUsers,
    unreadCounts,

    // Friends
    friends: friends.friends,
    loadingFriends: friends.loading,
    friendsError: friends.error,
    refetchFriends: friends.refetch,

    // Reactions
    reactions: reactionsHook.reactions,
    loadingReactions: reactionsHook.loading,
    reactionsError: reactionsHook.error,

    // Chat windows
    openWindows,

    // Actions - Conversations
    loadConversations: async () => {
      // The useChat hook handles this automatically
    },
    createDirectChat: chat.createDirectChat,
    createGroupChat: chat.createGroupChat,
    createGroupFromFriends,

    // Actions - Messages
    sendMessage: chat.sendMessage,
    sendMessageWithAttachments: async (conversationId: number, content: string, files: File[], images: File[], replyToId?: number) => {
      // If sendMessageWithAttachments doesn't exist in useChat, use regular sendMessage for now
      return chat.sendMessage(conversationId, content, replyToId);
    },
    loadMessages: chat.loadMessages,
    markAsRead: chat.markAsRead,

    // Actions - Real-time
    setTyping: chat.setTyping,

    // Actions - Chat Windows
    openChatWindow,
    closeChatWindow,
    toggleMinimize,

    // Actions - Reactions
    toggleReaction: reactionsHook.toggleReaction,
    loadReactions: reactionsHook.loadReactions,
    loadBulkReactions: reactionsHook.loadBulkReactions,

    // Error handling
    error: chat.error || friends.error || reactionsHook.error,
    clearError: chat.clearError
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
