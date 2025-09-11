"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/services/chat';
import {
  ChatConversation,
  ChatMessage,
  TypingIndicator,
  UseChatReturn,
  CreateDirectConversationRequest,
  CreateGroupConversationRequest,
  MessageReaction
} from '@/types/chat';

export function useChat(userId?: number, currentUserAvatar?: string): UseChatReturn {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Data state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [messages, setMessages] = useState<Map<number, ChatMessage[]>>(new Map());
  const [loadingMessages, setLoadingMessages] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<number, TypingIndicator[]>>(new Map());

  // Store the current user avatar
  const userAvatarRef = useRef<string | undefined>(currentUserAvatar);

  // Update avatar ref if it changes
  useEffect(() => {
    userAvatarRef.current = currentUserAvatar;
  }, [currentUserAvatar]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const messageHandlerRef = useRef<((message: ChatMessage) => void) | null>(null);
  const reactionHandlerRef = useRef<((reaction: MessageReaction) => void) | null>(null);
  const typingHandlerRef = useRef<((typing: TypingIndicator) => void) | null>(null);
  const connectedHandlerRef = useRef<(() => void) | null>(null);
  const disconnectedHandlerRef = useRef<(() => void) | null>(null);

  // ==================== CONNECTION MANAGEMENT ====================

  const connect = useCallback(async () => {
    if (!userId || isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      await chatService.connect(userId);
      setIsConnected(true);
    } catch (err) {
      setError('Failed to connect to chat service');
      console.error('Chat connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [userId, isConnected, isConnecting]);

  const disconnect = useCallback(() => {
    chatService.disconnect();
    setIsConnected(false);
  }, []);

  // ==================== MESSAGE HANDLERS ====================

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      const newMessages = new Map(prev);
      const conversationMessages = newMessages.get(message.conversationId) || [];

      // Check if message already exists (prevent duplicates)
      if (!conversationMessages.find(m => m.id === message.id)) {
        const updatedMessages = [...conversationMessages, message].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        newMessages.set(message.conversationId, updatedMessages);
      }

      return newMessages;
    });

    // Update conversation's last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === message.conversationId
          ? {
              ...conv,
              lastMessage: {
                id: message.id,
                content: message.content,
                senderName: message.senderName,
                createdAt: message.createdAt,
                type: message.type
              },
              unreadCount: conv.unreadCount + 1
            }
          : conv
      )
    );
  }, []);

  const handleReaction = useCallback((reaction: MessageReaction) => {
    // Update message reactions in the messages state
    setMessages(prev => {
      const newMessages = new Map(prev);
      const conversationMessages = newMessages.get(reaction.conversationId);

      if (conversationMessages) {
        const updatedMessages = conversationMessages.map(msg => {
          if (msg.id === reaction.messageId) {
            // Update message with new reaction data
            return {
              ...msg,
              // Add reaction handling logic here based on your UI needs
            };
          }
          return msg;
        });
        newMessages.set(reaction.conversationId, updatedMessages);
      }

      return newMessages;
    });
  }, []);

  const handleTyping = useCallback((typing: TypingIndicator) => {
    setTypingUsers(prev => {
      const newTypingUsers = new Map(prev);
      const conversationTyping = newTypingUsers.get(typing.conversationId) || [];

      if (typing.isTyping) {
        // Add or update typing user
        const existingIndex = conversationTyping.findIndex(t => t.userId === typing.userId);
        if (existingIndex >= 0) {
          conversationTyping[existingIndex] = typing;
        } else {
          conversationTyping.push(typing);
        }
      } else {
        // Remove typing user
        const filteredTyping = conversationTyping.filter(t => t.userId !== typing.userId);
        if (filteredTyping.length === 0) {
          newTypingUsers.delete(typing.conversationId);
          return newTypingUsers;
        }
        newTypingUsers.set(typing.conversationId, filteredTyping);
        return newTypingUsers;
      }

      newTypingUsers.set(typing.conversationId, conversationTyping);
      return newTypingUsers;
    });

    // Auto-remove typing indicator after 3 seconds
    setTimeout(() => {
      setTypingUsers(prev => {
        const newTypingUsers = new Map(prev);
        const conversationTyping = newTypingUsers.get(typing.conversationId) || [];
        const filteredTyping = conversationTyping.filter(t =>
          t.userId !== typing.userId ||
          new Date().getTime() - new Date(t.timestamp).getTime() < 3000
        );

        if (filteredTyping.length === 0) {
          newTypingUsers.delete(typing.conversationId);
        } else {
          newTypingUsers.set(typing.conversationId, filteredTyping);
        }

        return newTypingUsers;
      });
    }, 3000);
  }, []);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
    setIsConnecting(false);
    setError(null);
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // ==================== API ACTIONS ====================

  const loadConversations = useCallback(async () => {
    if (loadingConversations) return;

    setLoadingConversations(true);
    setError(null);

    try {
      const response = await chatService.getConversations();
      // FIXED: Deduplicate conversations by ID to prevent duplicate keys
      const uniqueConversations = response.content.reduce((acc: ChatConversation[], conv: ChatConversation) => {
        const existingIndex = acc.findIndex(existing => existing.id === conv.id);
        if (existingIndex >= 0) {
          // Replace with newer conversation data
          acc[existingIndex] = conv;
        } else {
          acc.push(conv);
        }
        return acc;
      }, []);

      console.log('Loading conversations with deduplication:', {
        originalCount: response.content.length,
        uniqueCount: uniqueConversations.length,
        duplicatesRemoved: response.content.length - uniqueConversations.length
      });

      setConversations(uniqueConversations);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Load conversations error:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [loadingConversations]);

  const loadMessages = useCallback(async (conversationId: number) => {
    if (loadingMessages.has(conversationId)) return;

    setLoadingMessages(prev => new Set(prev).add(conversationId));
    setError(null);

    try {
      const response = await chatService.getAllMessages(conversationId);
      setMessages(prev => {
        const newMessages = new Map(prev);
        newMessages.set(conversationId, response.messages);
        return newMessages;
      });
    } catch (err) {
      setError('Failed to load messages');
      console.error('Load messages error:', err);
    } finally {
      setLoadingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(conversationId);
        return newSet;
      });
    }
  }, [loadingMessages]);

  const sendMessage = useCallback(async (
    conversationId: number,
    content: string,
    replyToId?: number
  ) => {
    setError(null);

    // Generate unique client message ID to prevent duplicates
    const clientMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Optimistic update
      const tempMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        conversationId,
        senderId: userId!,
        senderName: 'You',
        type: 'TEXT',
        content,
        replyToId,
        createdAt: new Date().toISOString(),
        isEdited: false,
        isDeleted: false,
        senderAvatar: userAvatarRef.current // Include senderAvatar in optimistic message
      };

      // Add to messages immediately
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];

        // Check if message with same content and timestamp already exists
        const isDuplicate = conversationMessages.some(msg =>
          msg.content === content &&
          msg.senderId === userId &&
          Math.abs(new Date(msg.createdAt).getTime() - Date.now()) < 5000 // Within 5 seconds
        );

        if (isDuplicate) {
          console.log('Duplicate message detected, skipping optimistic update');
          return prev;
        }

        newMessages.set(conversationId, [...conversationMessages, tempMessage]);
        return newMessages;
      });

      // Send via API only (remove WebSocket duplicate)
      // The WebSocket will handle real-time delivery to other users
      const sentMessage = await chatService.sendMessage({
        conversationId,
        content,
        type: 'TEXT',
        replyToId
      });

      // Update with real message from server
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];

        // Replace temp message with real message
        const updatedMessages = conversationMessages.map(msg =>
          msg.id === tempMessage.id ? sentMessage : msg
        );

        newMessages.set(conversationId, updatedMessages);
        return newMessages;
      });

    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);

      // Remove optimistic message on failure
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];
        const filteredMessages = conversationMessages.filter(m =>
          !(m.id === tempMessage.id && m.content === content)
        );
        newMessages.set(conversationId, filteredMessages);
        return newMessages;
      });
    }
  }, [userId]);

  // ==================== SEND MESSAGE WITH ATTACHMENTS ====================

  const sendMessageWithAttachments = useCallback(async (
    conversationId: number,
    content: string,
    files: File[],
    images: File[],
    replyToId?: number
  ) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setError(null);

    try {
      // Create optimistic message for immediate UI feedback
      const tempMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        conversationId,
        senderId: userId,
        senderName: 'You',
        type: 'TEXT',
        content: content || '📎 Sending attachments...',
        replyToId,
        createdAt: new Date().toISOString(),
        isEdited: false,
        isDeleted: false,
        senderAvatar: userAvatarRef.current,
        // Add attachment info for UI
        fileAttachments: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        imageAttachments: images.map(i => ({ name: i.name, size: i.size, type: i.type }))
      };

      // Add to messages immediately for UI feedback
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];
        newMessages.set(conversationId, [...conversationMessages, tempMessage]);
        return newMessages;
      });

      // Send message with attachments
      const sentMessage = await chatService.sendMessageWithAttachments({
        conversationId,
        content,
        files,
        images,
        replyToId
      });

      // Update with real message from server
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];

        // Replace temp message with real message
        const updatedMessages = conversationMessages.map(msg =>
          msg.id === tempMessage.id ? sentMessage : msg
        );

        newMessages.set(conversationId, updatedMessages);
        return newMessages;
      });

    } catch (err) {
      setError('Failed to send message with attachments');
      console.error('Send message with attachments error:', err);

      // Remove optimistic message on failure
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];
        const filteredMessages = conversationMessages.filter(m => m.id !== tempMessage.id);
        newMessages.set(conversationId, filteredMessages);
        return newMessages;
      });
    }
  }, [userId]);

  const createDirectChat = useCallback(async (otherUserId: number): Promise<ChatConversation> => {
    setError(null);

    try {
      // FIXED: Check if conversation already exists before creating
      const existingConversation = conversations.find(conv =>
        conv.type === 'DIRECT' &&
        conv.participants?.some(p => p.id === otherUserId)
      );

      if (existingConversation) {
        console.log('Direct conversation already exists:', existingConversation.id);
        return existingConversation;
      }

      const conversation = await chatService.createDirectConversation({ otherUserId });

      // FIXED: Check if conversation was already added to prevent duplicates
      setConversations(prev => {
        const alreadyExists = prev.some(conv => conv.id === conversation.id);
        if (alreadyExists) {
          console.log('Conversation already in list, not adding duplicate');
          return prev;
        }
        return [conversation, ...prev];
      });

      return conversation;
    } catch (err) {
      setError('Failed to create direct chat');
      console.error('Create direct chat error:', err);
      throw err;
    }
  }, [conversations]);

  const createGroupChat = useCallback(async (
    name: string,
    memberIds: number[],
    description?: string
  ): Promise<ChatConversation> => {
    setError(null);

    try {
      const conversation = await chatService.createGroupConversation({
        name,
        memberIds,
        description
      });
      setConversations(prev => [conversation, ...prev]);
      return conversation;
    } catch (err) {
      setError('Failed to create group chat');
      console.error('Create group chat error:', err);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (messageId: number) => {
    try {
      await chatService.markMessageAsRead(messageId);
      chatService.markAsReadViaWebSocket(messageId);
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, []);

  const setTyping = useCallback((conversationId: number, isTyping: boolean) => {
    chatService.sendTypingIndicator(conversationId, isTyping);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== EFFECTS ====================

  // Setup event listeners
  useEffect(() => {
    // Store handlers in refs for cleanup
    messageHandlerRef.current = handleNewMessage;
    reactionHandlerRef.current = handleReaction;
    typingHandlerRef.current = handleTyping;
    connectedHandlerRef.current = handleConnected;
    disconnectedHandlerRef.current = handleDisconnected;

    // Add event listeners
    chatService.on('message', handleNewMessage);
    chatService.on('reaction', handleReaction);
    chatService.on('typing', handleTyping);
    chatService.on('connected', handleConnected);
    chatService.on('disconnected', handleDisconnected);

    return () => {
      // Remove event listeners using stored refs
      if (messageHandlerRef.current) {
        chatService.off('message', messageHandlerRef.current);
      }
      if (reactionHandlerRef.current) {
        chatService.off('reaction', reactionHandlerRef.current);
      }
      if (typingHandlerRef.current) {
        chatService.off('typing', typingHandlerRef.current);
      }
      if (connectedHandlerRef.current) {
        chatService.off('connected', connectedHandlerRef.current);
      }
      if (disconnectedHandlerRef.current) {
        chatService.off('disconnected', disconnectedHandlerRef.current);
      }
    };
  }, [handleNewMessage, handleReaction, handleTyping, handleConnected, handleDisconnected]);

  // Auto-connect when userId is available
  useEffect(() => {
    if (userId && !isConnected && !isConnecting) {
      connect();
    }
  }, [userId, isConnected, isConnecting, connect]);

  // Load conversations on connect
  useEffect(() => {
    if (isConnected && conversations.length === 0) {
      loadConversations();
    }
  }, [isConnected, conversations.length, loadConversations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected,
    isConnecting,

    // Data
    conversations,
    loadingConversations,
    messages,
    loadingMessages,

    // Actions
    sendMessage,
    sendMessageWithAttachments,
    createDirectChat,
    createGroupChat,
    loadMessages,
    markAsRead,

    // Real-time features
    typingUsers,
    setTyping,

    // Error handling
    error,
    clearError
  };
}
