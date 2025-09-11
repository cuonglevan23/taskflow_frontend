"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/services/chat';
import { MessageReaction, ReactionType, UseReactionsReturn, ChatMessage, ChatConversation, ChatUser, ChatWindow, TypingIndicator } from '@/types/chat';
import { useAuth } from '@/components/auth/AuthProvider';

export function useReactions(): UseReactionsReturn {
  const [reactions, setReactions] = useState<Map<number, MessageReaction['updatedSummary']>>(new Map());
  const [loading, setLoading] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const toggleReaction = useCallback(async (messageId: number, reactionType: ReactionType) => {
    if (loading.has(messageId)) return;

    setLoading(prev => new Set(prev).add(messageId));
    setError(null);

    try {
      const result = await chatService.toggleReaction(messageId, reactionType);

      // Update reactions state with the new summary
      setReactions(prev => {
        const newReactions = new Map(prev);
        newReactions.set(messageId, result.updatedSummary);
        return newReactions;
      });

    } catch (err) {
      console.error('Failed to toggle reaction:', err);
      setError('Failed to update reaction. Please try again.');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  }, [loading]);

  const loadReactions = useCallback(async (messageId: number) => {
    if (loading.has(messageId)) return;

    setLoading(prev => new Set(prev).add(messageId));
    setError(null);

    try {
      const reactionSummary = await chatService.getMessageReactions(messageId);
      setReactions(prev => {
        const newReactions = new Map(prev);
        newReactions.set(messageId, reactionSummary);
        return newReactions;
      });
    } catch (err) {
      console.error('Failed to load reactions:', err);
      setError('Failed to load reactions.');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  }, [loading]);
  const loadBulkReactions = useCallback(async (conversationId: number, messageIds: number[]) => {
    if (messageIds.length === 0) return;

    setError(null);

    try {
      const bulkResponse = await chatService.getBulkReactionSummaries(conversationId, messageIds);

      setReactions(prev => {
        const newReactions = new Map(prev);
        Object.entries(bulkResponse.messageReactions).forEach(([messageIdStr, summary]) => {
          const messageId = parseInt(messageIdStr);
          newReactions.set(messageId, summary as any);
        });
        return newReactions;
      });
    } catch (err) {
      console.error('Failed to load bulk reactions:', err);
      setError('Failed to load message reactions.');
    }
  }, []);

  return {
    reactions,
    loading,
    error,
    toggleReaction,
    loadReactions,
    loadBulkReactions
  };
}

export const useChat = () => {
  const { user } = useAuth();

  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [openWindows, setOpenWindows] = useState<Map<string, ChatWindow>>(new Map());
  const [messages, setMessages] = useState<Map<number, ChatMessage[]>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<number, string[]>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<number, number>>(new Map());

  // Add a ref to track processed message IDs to prevent duplicates
  const processedMessageIds = useRef(new Set<number>());

  // New: Track pending optimistic messages by conversation and content for matching with confirmed messages
  const pendingOptimisticMessages = useRef(new Map<string, number>());

  const nextZIndex = useRef(1000);

  // Define all handlers FIRST before they are used in useEffect

  // Define handlers as stable callbacks
  const handleNewMessage = useCallback((message: ChatMessage) => {
    // Check if we've already processed this message
    if (processedMessageIds.current.has(message.id)) {
      console.log('🔄 Duplicate message detected in handleNewMessage:', message.id);
      return;
    }

    // Mark as processed
    processedMessageIds.current.add(message.id);

    setMessages(prev => {
      const conversationMessages = prev.get(message.conversationId) || [];

      // Check if this message is a confirmation of an optimistic message
      const optimisticKey = `${message.conversationId}-${message.content}-${message.senderId}`;
      const optimisticId = pendingOptimisticMessages.current.get(optimisticKey);

      if (optimisticId) {
        console.log('🔄 Matched server confirmation with optimistic message:', {
          optimisticId,
          serverId: message.id,
          content: message.content.substring(0, 20) + '...'
        });

        // Remove the optimistic message tracking
        pendingOptimisticMessages.current.delete(optimisticKey);

        // Replace the optimistic message with the confirmed one
        return new Map(prev.set(message.conversationId,
          conversationMessages.map(msg =>
            msg.id === optimisticId ? message : msg
          )
        ));
      }

      return new Map(prev.set(message.conversationId, [...conversationMessages, message]));
    });

    // Update conversation last message
    setConversations(prev => prev.map(conv =>
      conv.id === message.conversationId
        ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
        : conv
    ));
  }, []);

  const handleConversationMessage = useCallback(({ conversationId, message }: { conversationId: number, message: ChatMessage }) => {
    // Check if we've already processed this message
    if (processedMessageIds.current.has(message.id)) {
      console.log('🔄 Duplicate message detected in handleConversationMessage:', message.id);
      return;
    }

    // Mark as processed
    processedMessageIds.current.add(message.id);

    setMessages(prev => {
      const conversationMessages = prev.get(conversationId) || [];

      // Check if this message is a confirmation of an optimistic message
      const optimisticKey = `${conversationId}-${message.content}-${message.senderId}`;
      const optimisticId = pendingOptimisticMessages.current.get(optimisticKey);

      if (optimisticId) {
        console.log('🔄 Matched server confirmation with optimistic message:', {
          optimisticId,
          serverId: message.id,
          content: message.content.substring(0, 20) + '...'
        });

        // Remove the optimistic message tracking
        pendingOptimisticMessages.current.delete(optimisticKey);

        // Replace the optimistic message with the confirmed one
        return new Map(prev.set(conversationId,
          conversationMessages.map(msg =>
            msg.id === optimisticId ? message : msg
          )
        ));
      }

      return new Map(prev.set(conversationId, [...conversationMessages, message]));
    });

    // Auto mark as read if window is open and focused
    const windowKey = `chat-${conversationId}`;
    const chatWindow = openWindows.get(windowKey);
    if (chatWindow && !chatWindow.isMinimized) {
      setTimeout(() => {
        chatService.markAsRead(message.id, conversationId);
      }, 1000);
    }
  }, [openWindows]);

  const handleTypingStatus = useCallback((typing: TypingIndicator) => {
    setTypingUsers(prev => {
      const conversationTyping = prev.get(typing.conversationId) || [];
      const newTyping = typing.isTyping
        ? [...conversationTyping.filter(name => name !== typing.userName), typing.userName]
        : conversationTyping.filter(name => name !== typing.userName);

      return new Map(prev.set(typing.conversationId, newTyping));
    });

    // Clear typing after 3 seconds
    if (typing.isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => {
          const conversationTyping = prev.get(typing.conversationId) || [];
          const filtered = conversationTyping.filter(name => name !== typing.userName);
          return new Map(prev.set(typing.conversationId, filtered));
        });
      }, 3000);
    }
  }, []);

  const handleUnreadCountUpdate = useCallback((update: any) => {
    setUnreadCounts(prev => new Map(prev.set(update.conversationId, update.count)));
  }, []);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
  }, []);

  // Define helper functions
  const setupEventHandlers = useCallback(() => {
    // Connected/Disconnected
    chatService.on('connected', handleConnected);
    chatService.on('disconnected', handleDisconnected);

    // New messages
    chatService.on('newMessage', handleNewMessage);
    chatService.on('conversationMessage', handleConversationMessage);

    // Status updates
    chatService.on('typingStatus', handleTypingStatus);
    chatService.on('unreadCountUpdate', handleUnreadCountUpdate);
  }, [handleConnected, handleDisconnected, handleNewMessage, handleConversationMessage, handleTypingStatus, handleUnreadCountUpdate]);

  const loadConversations = async () => {
    try {
      const response = await chatService.getConversations();
      setConversations(response.content);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const initializeChat = async (userId: number) => {
    console.log('🔄 Starting chat initialization (trusted domain approach)...', {
      userId,
      authMethod: 'Trusted authenticated domain',
      origin: window.location.origin,
      timestamp: new Date().toISOString()
    });

    try {
      chatService.clearAllHandlers();
      console.log('✅ Cleared existing handlers');

      setupEventHandlers();
      console.log('✅ Setup event handlers complete');

      console.log('🔌 Attempting WebSocket connection...');
      await chatService.connect(userId);
      console.log('✅ WebSocket connection successful via trusted domain');

      console.log('📂 Loading conversations...');
      await loadConversations();
      console.log('✅ Chat initialization complete');

    } catch (error) {
      console.error('❌ Chat initialization failed:', {
        error: (error as Error)?.message || 'Unknown error',
        type: error?.constructor?.name,
        userId,
        authMethod: 'Trusted domain',
        origin: window.location.origin
      });
      setIsConnected(false);
      throw error;
    }
  };

  // Initialize chat connection - NOW useEffect comes AFTER all handlers are defined
  useEffect(() => {
    console.log('🔍 useChat useEffect triggered with user:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authMethod: 'Trusted domain (no token validation)'
    });

    const initializeChatConnection = async () => {
      console.log('🔑 Initializing chat with trusted domain approach...');

      if (!user?.id) {
        console.warn('⚠️ No user ID found, skipping chat initialization');
        return;
      }

      const userId = parseInt(user.id);
      if (isNaN(userId) || userId <= 0) {
        console.error('⚠️ Invalid user ID format:', user.id);
        return;
      }

      console.log('✅ User authenticated via domain, starting chat connection...', {
        userId,
        origin: window.location.origin,
        approach: 'Trust authenticated domain'
      });

      try {
        // First, clean up any existing listeners to prevent duplicates
        chatService.clearAllHandlers();

        // Setup event handlers
        setupEventHandlers();

        // Now connect
        await initializeChat(userId);
      } catch (error) {
        console.error('❌ Chat initialization failed:', error);
      }
    };

    if (user?.id) {
      console.log('✅ User available, initializing chat immediately');
      initializeChatConnection();
    } else {
      console.log('⏳ User not available, setting up retry...');
      const retryTimeout = setTimeout(() => {
        console.log('🔄 Retrying chat initialization after delay...');
        initializeChatConnection();
      }, 3000);

      return () => {
        console.log('🧹 Cleaning up chat service on unmount/user change');
        clearTimeout(retryTimeout);

        // Important: Clean up all handlers to prevent duplicates on re-mount
        chatService.clearAllHandlers();
      };
    }

    // Return cleanup function
    return () => {
      console.log('🧹 Cleaning up chat service on unmount/user change');

      // Important: Clean up all handlers to prevent duplicates on re-mount
      chatService.clearAllHandlers();
    };
  }, [user?.id, setupEventHandlers]);

  // Load messages using ChatService - FIXED
  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      console.log('🔍 Loading messages for conversation:', conversationId);
      const response = await chatService.getConversationMessages(conversationId);
      console.log('📥 Raw messages response:', response);

      // ✅ SỬA: Xử lý response structure đúng cách theo ChatHistoryResponse
      let messagesList: ChatMessage[];

      if (Array.isArray(response)) {
        // Response là array trực tiếp
        messagesList = response;
      } else if (response.messages && Array.isArray(response.messages)) {
        // ✅ CHÍNH: Response có structure { messages: [...] } - ChatHistoryResponse
        messagesList = response.messages;
        console.log('✅ Found messages in response.messages field');
      } else if ((response as any).content && Array.isArray((response as any).content)) {
        // Fallback: Standard paginated response { content: [...], page: {...} }
        messagesList = (response as any).content;
        console.log('✅ Found messages in response.content field (fallback)');
      } else if ((response as any).data && Array.isArray((response as any).data)) {
        // Fallback: Response có structure { data: [...] }
        messagesList = (response as any).data;
        console.log('✅ Found messages in response.data field (fallback)');
      } else {
        console.warn('⚠️ Unknown response structure for messages:', {
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : [],
          hasMessages: !!(response as any)?.messages,
          hasContent: !!(response as any)?.content,
          hasData: !!(response as any)?.data,
          response
        });
        messagesList = [];
      }

      console.log('✅ Parsed messages:', {
        conversationId,
        count: messagesList.length,
        firstMessage: messagesList[0],
        lastMessage: messagesList[messagesList.length - 1]
      });

      if (messagesList.length === 0) {
        console.log('📭 No messages found for conversation:', conversationId);
        setMessages(prev => new Map(prev.set(conversationId, [])));
        return;
      }

      // ✅ SỬA: Đảm bảo messages được sort theo thời gian (cũ nhất trước)
      const sortedMessages = messagesList.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeA - timeB; // Ascending order (oldest first)
      });

      console.log('✅ Sorted messages chronologically:', {
        count: sortedMessages.length,
        firstMessageTime: sortedMessages[0]?.createdAt,
        lastMessageTime: sortedMessages[sortedMessages.length - 1]?.createdAt
      });

      // ✅ SỬA: Clear processed IDs for this conversation để tránh duplicate detection
      sortedMessages.forEach(msg => {
        if (msg.id) {
          processedMessageIds.current.add(msg.id);
        }
      });

      setMessages(prev => new Map(prev.set(conversationId, sortedMessages)));

      // Subscribe to conversation updates for real-time messages
      chatService.subscribeToConversation(conversationId);

      console.log('✅ Messages loaded successfully for conversation:', conversationId);
    } catch (error) {
      console.error('❌ Error loading messages for conversation', conversationId, ':', error);
      // Set empty array on error to prevent infinite loading
      setMessages(prev => new Map(prev.set(conversationId, [])));
    }
  }, []);

  // Find or create conversation using ChatService
  const findOrCreateConversation = async (otherUserId: number): Promise<ChatConversation> => {
    // First check if conversation already exists
    const existing = conversations.find(conv =>
      conv.type === 'DIRECT' &&
      conv.participants && conv.participants.some(p => p.id === otherUserId)
    );

    if (existing) {
      return existing;
    }

    // Create new conversation using ChatService
    try {
      const newConversation = await chatService.createDirectConversation(otherUserId);
      console.log('🔍 API Response for new conversation:', newConversation);

      // Đảm bảo newConversation có cấu trúc phù hợp với ChatConversation type
      // API trả về { id, type, name, avatarUrl, memberCount, unreadCount, createdAt }
      const formattedConversation: ChatConversation = {
        ...newConversation,
        id: Number(newConversation.id),
        type: newConversation.type || 'DIRECT',
        name: newConversation.name || '',
        avatarUrl: newConversation.avatarUrl || '',
        memberCount: newConversation.memberCount || 2,
        unreadCount: newConversation.unreadCount || 0,
        lastActivity: newConversation.createdAt || new Date().toISOString(),
        createdAt: newConversation.createdAt || new Date().toISOString(),
        participants: newConversation.participants || []
      };

      setConversations(prev => [formattedConversation, ...prev]);
      return formattedConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  // Open chat window
  const openChatWindow = useCallback((user: ChatUser) => {
    console.log('🔍 useChat: openChatWindow called with user:', user);

    const windowKey = `chat-${user.id}`;
    console.log('🔍 useChat: windowKey:', windowKey);
    console.log('🔍 useChat: current openWindows:', openWindows);

    if (openWindows.has(windowKey)) {
      console.log('🔍 useChat: Window already exists, bringing to front');
      // If window exists, just bring to front and expand
      setOpenWindows(prev => {
        const window = prev.get(windowKey)!;
        const updated = new Map(prev);
        updated.set(windowKey, {
          ...window,
          isMinimized: false,
          zIndex: nextZIndex.current++
        });
        return updated;
      });
      return;
    }

    console.log('🔍 useChat: Creating new chat window');

    // Calculate position for new window
    const existingWindows = Array.from(openWindows.values());
    const windowWidth = 350;
    const windowSpacing = 20;
    const rightOffset = 20;

    // ✅ SỬA: Đảm bảo window object tồn tại trước khi truy cập
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    const position = {
      x: screenWidth - rightOffset - windowWidth - (existingWindows.length * (windowWidth + windowSpacing)),
      y: screenHeight - 500 - 20 // Height + bottom offset
    };

    const newWindow: ChatWindow = {
      id: windowKey,
      conversationId: 0, // Will be set when conversation is created/found
      user,
      isMinimized: false,
      isMaximized: false,
      position,
      zIndex: nextZIndex.current++
    };

    console.log('🔍 useChat: Adding new window to openWindows');
    setOpenWindows(prev => new Map(prev.set(windowKey, newWindow)));

    // Find or create conversation
    console.log('🔍 useChat: Finding or creating conversation for user:', user.id);
    findOrCreateConversation(user.id).then(conversation => {
      console.log('✅ useChat: Conversation found/created:', conversation);
      setOpenWindows(prev => {
        const window = prev.get(windowKey);
        if (window) {
          const updated = new Map(prev);
          updated.set(windowKey, { ...window, conversationId: conversation.id });
          return updated;
        }
        return prev;
      });

      // Load messages for this conversation
      loadMessages(conversation.id);
    }).catch(error => {
      console.error('❌ useChat: Error creating conversation:', error);
      // For now, still show the chat window even if conversation creation fails
    });
  }, [openWindows, conversations]);

  // Close chat window
  const closeChatWindow = useCallback((windowKey: string) => {
    const window = openWindows.get(windowKey);
    if (window && window.conversationId) {
      chatService.unsubscribeFromConversation(window.conversationId);
    }

    setOpenWindows(prev => {
      const updated = new Map(prev);
      updated.delete(windowKey);
      return updated;
    });
  }, [openWindows]);

  // Minimize/Maximize window
  const toggleMinimize = useCallback((windowKey: string) => {
    setOpenWindows(prev => {
      const window = prev.get(windowKey);
      if (window) {
        const updated = new Map(prev);
        updated.set(windowKey, { ...window, isMinimized: !window.isMinimized });
        return updated;
      }
      return prev;
    });
  }, []);

  // Send message using ChatService
  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (!content.trim()) return;

    // Check if conversation is valid
    if (!conversationId || conversationId === 0) {
      console.warn('Cannot send message: invalid conversationId', conversationId);
      return;
    }

    // Check if chat is connected
    if (!isConnected) {
      console.warn('Cannot send message: chat not connected');
      return;
    }

    // Create optimistic message for immediate UI update
    const optimisticId = Date.now(); // Sử dụng timestamp để tạo ID tạm thời
    const optimisticMessage: ChatMessage = {
      id: optimisticId, // Temporary ID
      conversationId,
      senderId: parseInt(user?.id || '0'),
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar,
      content: content.trim(),
      type: 'TEXT',
      createdAt: new Date().toISOString(),
      isRead: false,
      isDelivered: false
    };

    // Add optimistic message to UI immediately with improved duplicate detection
    setMessages(prev => {
      const conversationMessages = prev.get(conversationId) || [];

      // Detect rapid duplicate messages (within 800ms)
      const lastMessage = conversationMessages.length > 0 ?
        conversationMessages[conversationMessages.length - 1] : null;

      // Only block if same content, same sender AND within 800ms (prevents accidental double-click)
      if (lastMessage &&
          lastMessage.content === optimisticMessage.content &&
          lastMessage.senderId === optimisticMessage.senderId &&
          // Less strict timing window (800ms) to only prevent true double-clicks/submissions
          (new Date().getTime() - new Date(lastMessage.createdAt).getTime() < 800)) {
        console.log('🔄 Possible double-click detected:', optimisticMessage.content);
        return prev; // Ignore only if it's likely an accidental double-click
      }

      // Create tracking key for optimistic message to match with server confirmation later
      const optimisticKey = `${conversationId}-${optimisticMessage.content}-${optimisticMessage.senderId}`;
      pendingOptimisticMessages.current.set(optimisticKey, optimisticId);

      console.log('✉️ Thêm tin nhắn lạc quan:', optimisticId);
      return new Map(prev.set(conversationId, [...conversationMessages, optimisticMessage]));
    });

    // Gửi tin nhắn thực tế đến server
    chatService.sendMessage(conversationId, content.trim());
  }, [isConnected, user]);

  // Set typing using ChatService
  const setTyping = useCallback((conversationId: number, isTyping: boolean) => {
    if (!conversationId || conversationId === 0) return;
    if (!isConnected) return;

    // Get user name from auth context
    const userName = user?.name || `${user?.id}` || 'Unknown User';
    chatService.setTyping(conversationId, isTyping, userName);
  }, [user, isConnected]);

  return {
    isConnected,
    conversations,
    openWindows: Array.from(openWindows.values()),
    messages,
    typingUsers,
    unreadCounts,

    // Actions
    openChatWindow,
    closeChatWindow,
    toggleMinimize,
    sendMessage,
    setTyping,
    loadMessages,
    loadConversations
  };
};
