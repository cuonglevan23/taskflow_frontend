"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import { ChatBotService } from "@/services/chatbot";
import {
  ChatMessage,
  SendMessageRequest,
  GetMessagesResponse,
  ConversationContext as ChatBotConversationContext
} from "@/services/chatbot/types";
import { useAuth } from "@/components/auth/AuthProvider";

// Extended message interface for UI state
export interface UIChatMessage extends ChatMessage {
  isLoading?: boolean;
  isError?: boolean;
  retryCount?: number;
}

// Chat session state
export interface ChatSession {
  conversationId: string;
  isActive: boolean;
  messageCount: number;
  lastMessageAt: string;
  title?: string;
}

// ChatBot filters and preferences
export interface ChatBotFilters {
  searchQuery?: string;
  dateRange?: { start: Date; end: Date };
  senderType?: 'USER' | 'AGENT' | 'ALL';
  showFeedbackOnly?: boolean;
}

// ChatBot statistics
export interface ChatBotStats {
  totalMessages: number;
  totalConversations: number;
  averageResponseTime: number;
  satisfactionRating: number;
  activeConversations: number;
  messagesByType: {
    user: number;
    agent: number;
  };
}

interface ChatBotContextType {
  // Current conversation state
  currentConversation: ChatSession | null;
  messages: UIChatMessage[];
  isTyping: boolean;

  // Data state
  conversations: ChatSession[];
  stats: ChatBotStats | null;

  // Loading states
  isLoading: boolean;
  isLoadingMessages: boolean;
  isLoadingConversations: boolean;
  isSending: boolean;

  // Error states
  error: string | null;
  messageError: string | null;

  // Filters and preferences
  filters: ChatBotFilters;

  // Core actions
  sendMessage: (content: string, conversationId?: string) => Promise<void>;
  startNewConversation: () => Promise<void>;
  switchConversation: (conversationId: string) => Promise<void>;
  endCurrentConversation: () => Promise<void>;

  // Message management
  loadMessages: (conversationId?: string) => Promise<void>;
  loadAllMessages: () => Promise<boolean>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;

  // Conversation management
  loadConversations: () => Promise<void>;
  loadConversationHistory: (page?: number, limit?: number) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;

  // Feedback and interactions
  provideFeedback: (messageId: string, rating: number, feedback?: string) => Promise<void>;
  escalateToAdmin: (reason?: string) => Promise<void>;

  // Statistics
  refreshStats: () => Promise<void>;

  // Filters and utilities
  setFilters: (filters: Partial<ChatBotFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearMessages: () => void;

  // UI state management
  setTyping: (isTyping: boolean) => void;
  filteredMessages: UIChatMessage[];
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

interface ChatBotProviderProps {
  children: ReactNode;
  autoLoadConversations?: boolean;
}

export function ChatBotProvider({
  children,
  autoLoadConversations = true
}: ChatBotProviderProps) {
  const { user } = useAuth();

  // Core state
  const [currentConversation, setCurrentConversation] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<UIChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState<ChatBotStats | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Filters
  const [filters, setFiltersState] = useState<ChatBotFilters>({});

  // Filtered messages based on current filters
  const filteredMessages = useMemo(() => {
    let filtered = [...messages];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(msg =>
        msg.content.toLowerCase().includes(query)
      );
    }

    if (filters.senderType && filters.senderType !== 'ALL') {
      filtered = filtered.filter(msg => msg.senderType === filters.senderType);
    }

    if (filters.showFeedbackOnly) {
      filtered = filtered.filter(msg => msg.senderType === 'AGENT');
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return msgDate >= start && msgDate <= end;
      });
    }

    return filtered;
  }, [messages, filters]);

  // Send message action
  const sendMessage = useCallback(async (content: string, conversationId?: string) => {
    if (!content.trim()) return;

    setIsSending(true);
    setMessageError(null);

    try {
      // Add user message immediately for UI responsiveness
      const tempUserMessage: UIChatMessage = {
        messageId: `temp-${Date.now()}`,
        content: content.trim(),
        senderType: 'USER',
        timestamp: new Date().toISOString(),
        conversationId: conversationId || currentConversation?.conversationId || '',
        success: true
      };

      setMessages(prev => [...prev, tempUserMessage]);
      setIsTyping(true);

      // Send to API
      const response = await ChatBotService.sendMessage({
        content: content.trim(),
        conversationId: conversationId || currentConversation?.conversationId
      });

      // Remove temp message and add real messages
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => msg.messageId !== tempUserMessage.messageId);

        // Add user message from response if not duplicate
        const realUserMessage: UIChatMessage = {
          messageId: `user-${response.messageId}`,
          content: content.trim(),
          senderType: 'USER',
          timestamp: new Date().toISOString(),
          conversationId: response.conversationId,
          success: true
        };

        // Add agent response
        const agentMessage: UIChatMessage = {
          ...response,
          isLoading: false
        };

        return [...withoutTemp, realUserMessage, agentMessage];
      });

      // Update current conversation if needed
      if (!currentConversation && response.conversationId) {
        setCurrentConversation({
          conversationId: response.conversationId,
          isActive: true,
          messageCount: 2,
          lastMessageAt: response.timestamp,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : '')
        });
      }

    } catch (err) {
      console.error('Failed to send message:', err);
      setMessageError(err instanceof Error ? err.message : 'Failed to send message');

      // Mark temp message as error
      setMessages(prev => prev.map(msg =>
        msg.messageId === `temp-${Date.now()}`
          ? { ...msg, isError: true }
          : msg
      ));
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }, [currentConversation]);

  // Start new conversation
  const startNewConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newConversation = await ChatBotService.startNewConversation();

      const session: ChatSession = {
        conversationId: newConversation.conversationId,
        isActive: newConversation.isActive,
        messageCount: newConversation.messageCount,
        lastMessageAt: newConversation.lastMessageAt,
        title: 'New Conversation'
      };

      setCurrentConversation(session);
      setMessages([]);
      setConversations(prev => [session, ...prev]);

    } catch (err) {
      console.error('Failed to start new conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId?: string) => {
    const targetConversationId = conversationId || currentConversation?.conversationId;
    if (!targetConversationId) return;

    setIsLoadingMessages(true);
    setMessageError(null);

    try {
      const response = await ChatBotService.getMessages(targetConversationId);
      const uiMessages: UIChatMessage[] = response.map(msg => ({
        ...msg,
        isLoading: false,
        isError: false,
        retryCount: 0
      }));

      setMessages(uiMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessageError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentConversation]);

  // Load all messages without conversation ID (for getting chat history)
  const loadAllMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    setMessageError(null);

    try {
      console.log('📨 Loading all chat messages from API...');
      const response = await ChatBotService.getMessages(); // Call without conversationId to get all messages

      if (response && response.length > 0) {
        const uiMessages: UIChatMessage[] = response.map(msg => ({
          ...msg,
          isLoading: false,
          isError: false,
          retryCount: 0
        }));

        setMessages(uiMessages);
        console.log('✅ Loaded', uiMessages.length, 'messages from server');

        // If we have messages, try to set up current conversation context
        if (uiMessages.length > 0) {
          const lastMessage = uiMessages[uiMessages.length - 1];
          if (lastMessage.conversationId && !currentConversation) {
            setCurrentConversation({
              conversationId: lastMessage.conversationId,
              isActive: true,
              messageCount: uiMessages.length,
              lastMessageAt: lastMessage.timestamp,
              title: 'Existing Conversation'
            });
          }
        }

        return uiMessages.length > 0;
      } else {
        console.log('📝 No existing messages found');
        return false;
      }
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      setMessageError(err instanceof Error ? err.message : 'Failed to load messages');
      return false;
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentConversation]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError(null);

    try {
      const response = await ChatBotService.getConversationHistory();
      const sessions: ChatSession[] = response.map(conv => ({
        conversationId: conv.conversationId,
        isActive: conv.isActive,
        messageCount: conv.messageCount,
        lastMessageAt: conv.lastMessageAt,
        title: `Conversation ${conv.conversationId.substring(0, 8)}`
      }));

      setConversations(sessions);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Switch conversation
  const switchConversation = useCallback(async (conversationId: string) => {
    const conversation = conversations.find(c => c.conversationId === conversationId);
    if (!conversation) return;

    setCurrentConversation(conversation);
    await loadMessages(conversationId);
  }, [conversations, loadMessages]);

  // Other actions with basic implementations
  const endCurrentConversation = useCallback(async () => {
    if (!currentConversation) return;

    try {
      await ChatBotService.endConversation(currentConversation.conversationId);
      setCurrentConversation(null);
      setMessages([]);
      await loadConversations(); // Refresh conversation list
    } catch (err) {
      console.error('Failed to end conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to end conversation');
    }
  }, [currentConversation, loadConversations]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await ChatBotService.markMessageAsRead(messageId);
      // Update local state if needed
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  }, []);

  const provideFeedback = useCallback(async (messageId: string, rating: number, feedback?: string) => {
    try {
      await ChatBotService.provideFeedback(messageId, rating, feedback);
      // Update local state to show feedback was submitted
    } catch (err) {
      console.error('Failed to provide feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  }, []);

  const escalateToAdmin = useCallback(async (reason?: string) => {
    if (!currentConversation) return;

    try {
      await ChatBotService.escalateToAdmin(currentConversation.conversationId, reason);
      // Update UI to show escalation status
    } catch (err) {
      console.error('Failed to escalate to admin:', err);
      setError(err instanceof Error ? err.message : 'Failed to escalate to admin');
    }
  }, [currentConversation]);

  // Utility functions
  const setFilters = useCallback((newFilters: Partial<ChatBotFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setMessageError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const retryMessage = useCallback(async (messageId: string) => {
    // Implementation for retrying failed messages
    console.log('Retrying message:', messageId);
  }, []);

  const loadConversationHistory = useCallback(async (page = 1, limit = 20) => {
    try {
      const response = await ChatBotService.getConversationHistory(page, limit);
      // Handle paginated results
    } catch (err) {
      console.error('Failed to load conversation history:', err);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await ChatBotService.endConversation(conversationId);
      setConversations(prev => prev.filter(c => c.conversationId !== conversationId));
      if (currentConversation?.conversationId === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  }, [currentConversation]);

  const refreshStats = useCallback(async () => {
    // Implementation for refreshing statistics
    console.log('Refreshing stats...');
  }, []);

  // Auto-load data on mount and user change
  useEffect(() => {
    if (user && autoLoadConversations) {
      loadConversations();
    }
  }, [user, autoLoadConversations, loadConversations]);

  const contextValue = useMemo<ChatBotContextType>(() => ({
    // Current conversation state
    currentConversation,
    messages,
    isTyping,

    // Data state
    conversations,
    stats,

    // Loading states
    isLoading,
    isLoadingMessages,
    isLoadingConversations,
    isSending,

    // Error states
    error,
    messageError,

    // Filters
    filters,
    filteredMessages,

    // Core actions
    sendMessage,
    startNewConversation,
    switchConversation,
    endCurrentConversation,

    // Message management
    loadMessages,
    loadAllMessages,
    markMessageAsRead,
    retryMessage,

    // Conversation management
    loadConversations,
    loadConversationHistory,
    deleteConversation,

    // Feedback and interactions
    provideFeedback,
    escalateToAdmin,

    // Statistics
    refreshStats,

    // Filters and utilities
    setFilters,
    clearFilters,
    clearError,
    clearMessages,

    // UI state management
    setTyping: setIsTyping
  }), [
    currentConversation,
    messages,
    isTyping,
    conversations,
    stats,
    isLoading,
    isLoadingMessages,
    isLoadingConversations,
    isSending,
    error,
    messageError,
    filters,
    filteredMessages,
    sendMessage,
    startNewConversation,
    switchConversation,
    endCurrentConversation,
    loadMessages,
    loadAllMessages,
    markMessageAsRead,
    retryMessage,
    loadConversations,
    loadConversationHistory,
    deleteConversation,
    provideFeedback,
    escalateToAdmin,
    refreshStats,
    setFilters,
    clearFilters,
    clearError,
    clearMessages
  ]);

  return (
    <ChatBotContext.Provider value={contextValue}>
      {children}
    </ChatBotContext.Provider>
  );
}

// Custom hook to use ChatBot context
export function useChatBot() {
  const context = useContext(ChatBotContext);
  if (context === undefined) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
}

export default ChatBotContext;
