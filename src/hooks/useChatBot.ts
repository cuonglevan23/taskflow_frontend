// ChatBot Hook - Convenient methods for using ChatBot services
// Provides easy-to-use methods for interacting with AI Agent functionality

import { useCallback, useState, useRef, useEffect } from 'react';
import { useChatBot } from '@/contexts/ChatBotContext';
import { ChatBotService } from '@/services/chatbot';
import { UIChatMessage } from '@/contexts/ChatBotContext';

// Hook options for customization
export interface UseChatBotOptions {
  autoScroll?: boolean;
  maxRetries?: number;
  typingDelay?: number;
  enableAutoSave?: boolean;
}

// Hook return type with convenience methods
export interface UseChatBotHook {
  // Context data (re-exported for convenience)
  currentConversation: ReturnType<typeof useChatBot>['currentConversation'];
  messages: ReturnType<typeof useChatBot>['messages'];
  filteredMessages: ReturnType<typeof useChatBot>['filteredMessages'];
  conversations: ReturnType<typeof useChatBot>['conversations'];

  // Loading states
  isLoading: boolean;
  isSending: boolean;
  isTyping: boolean;

  // Error states
  error: string | null;

  // Input management
  inputMessage: string;
  setInputMessage: (message: string) => void;

  // Quick actions
  sendQuickMessage: (message: string) => Promise<void>;
  sendCurrentMessage: () => Promise<void>;
  clearInput: () => void;

  // Conversation management
  startFreshConversation: () => Promise<void>;
  switchToConversation: (conversationId: string) => Promise<void>;
  endCurrentChat: () => Promise<void>;

  // Message utilities
  getLastAgentMessage: () => UIChatMessage | null;
  getLastUserMessage: () => UIChatMessage | null;
  loadAllMessages: () => Promise<boolean>;
  scrollToBottom: () => void;

  // Feedback helpers
  rateLastMessage: (rating: number, feedback?: string) => Promise<void>;
  escalateCurrentConversation: (reason?: string) => Promise<void>;

  // Search and filtering
  searchMessages: (query: string) => void;
  filterByType: (type: 'USER' | 'AGENT' | 'ALL') => void;
  clearSearch: () => void;

  // Utility functions
  retry: () => Promise<void>;
  clearAllErrors: () => void;
  refreshConversations: () => Promise<void>;

  // Keyboard shortcuts support
  handleKeyPress: (e: React.KeyboardEvent) => void;

  // Message refs for scrolling
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

/**
 * Custom hook for ChatBot functionality
 * Provides convenient methods for interacting with AI Agent services
 */
export function useChatBotHook(options: UseChatBotOptions = {}): UseChatBotHook {
  const {
    autoScroll = true,
    maxRetries = 3,
    typingDelay = 1000,
    enableAutoSave = true
  } = options;

  // Get context data
  const chatBotContext = useChatBot();
  const {
    currentConversation,
    messages,
    filteredMessages,
    conversations,
    isLoading,
    isSending,
    isTyping,
    error,
    messageError,
    sendMessage,
    startNewConversation,
    switchConversation,
    endCurrentConversation,
    provideFeedback,
    escalateToAdmin,
    setFilters,
    clearFilters,
    clearError,
    loadConversations
  } = chatBotContext;

  // Local state for input management
  const [inputMessage, setInputMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [autoScroll]);

  // Auto-scroll effect
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, scrollToBottom]);

  // Send quick message (without managing input state)
  const sendQuickMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    try {
      await sendMessage(message.trim());
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Failed to send quick message:', err);
      throw err;
    }
  }, [sendMessage]);

  // Send current input message
  const sendCurrentMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const messageToSend = inputMessage.trim();
    setInputMessage(''); // Clear input immediately for better UX

    try {
      await sendMessage(messageToSend);
      setRetryCount(0);
    } catch (err) {
      // Restore message to input if failed
      setInputMessage(messageToSend);
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [inputMessage, sendMessage]);

  // Clear input
  const clearInput = useCallback(() => {
    setInputMessage('');
  }, []);

  // Start fresh conversation
  const startFreshConversation = useCallback(async () => {
    try {
      await startNewConversation();
      setInputMessage(''); // Clear any draft message
      setRetryCount(0);
    } catch (err) {
      console.error('Failed to start fresh conversation:', err);
      throw err;
    }
  }, [startNewConversation]);

  // Switch to conversation
  const switchToConversation = useCallback(async (conversationId: string) => {
    try {
      await switchConversation(conversationId);
      setInputMessage(''); // Clear draft when switching
    } catch (err) {
      console.error('Failed to switch conversation:', err);
      throw err;
    }
  }, [switchConversation]);

  // End current chat
  const endCurrentChat = useCallback(async () => {
    try {
      await endCurrentConversation();
      setInputMessage('');
      setRetryCount(0);
    } catch (err) {
      console.error('Failed to end conversation:', err);
      throw err;
    }
  }, [endCurrentConversation]);

  // Get last agent message
  const getLastAgentMessage = useCallback((): UIChatMessage | null => {
    const agentMessages = messages.filter(msg => msg.senderType === 'AGENT');
    return agentMessages.length > 0 ? agentMessages[agentMessages.length - 1] : null;
  }, [messages]);

  // Get last user message
  const getLastUserMessage = useCallback((): UIChatMessage | null => {
    const userMessages = messages.filter(msg => msg.senderType === 'USER');
    return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
  }, [messages]);

  // Load all messages from server
  const loadAllMessages = useCallback(async (): Promise<boolean> => {
    try {
      return await chatBotContext.loadAllMessages();
    } catch (err) {
      console.error('Failed to load all messages:', err);
      throw err;
    }
  }, [chatBotContext]);

  // Rate last agent message
  const rateLastMessage = useCallback(async (rating: number, feedback?: string) => {
    const lastAgentMessage = getLastAgentMessage();
    if (!lastAgentMessage) {
      throw new Error('No agent message to rate');
    }

    try {
      await provideFeedback(lastAgentMessage.messageId, rating, feedback);
    } catch (err) {
      console.error('Failed to rate message:', err);
      throw err;
    }
  }, [getLastAgentMessage, provideFeedback]);

  // Escalate current conversation
  const escalateCurrentConversation = useCallback(async (reason?: string) => {
    if (!currentConversation) {
      throw new Error('No active conversation to escalate');
    }

    try {
      await escalateToAdmin(reason);
    } catch (err) {
      console.error('Failed to escalate conversation:', err);
      throw err;
    }
  }, [currentConversation, escalateToAdmin]);

  // Search messages
  const searchMessages = useCallback((query: string) => {
    setFilters({ searchQuery: query });
  }, [setFilters]);

  // Filter by message type
  const filterByType = useCallback((type: 'USER' | 'AGENT' | 'ALL') => {
    setFilters({ senderType: type });
  }, [setFilters]);

  // Clear search and filters
  const clearSearch = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Retry last failed action
  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      throw new Error('Maximum retry attempts reached');
    }

    setRetryCount(prev => prev + 1);

    // Retry sending current message if there was an error
    if (messageError && inputMessage.trim()) {
      try {
        await sendCurrentMessage();
      } catch (err) {
        console.error('Retry failed:', err);
        throw err;
      }
    }
  }, [retryCount, maxRetries, messageError, inputMessage, sendCurrentMessage]);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    clearError();
    setRetryCount(0);
  }, [clearError]);

  // Refresh conversations
  const refreshConversations = useCallback(async () => {
    try {
      await loadConversations();
    } catch (err) {
      console.error('Failed to refresh conversations:', err);
      throw err;
    }
  }, [loadConversations]);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    // Enter to send (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCurrentMessage().catch(console.error);
    }

    // Escape to clear input
    if (e.key === 'Escape') {
      e.preventDefault();
      clearInput();
    }

    // Ctrl+N for new conversation
    if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      startFreshConversation().catch(console.error);
    }
  }, [sendCurrentMessage, clearInput, startFreshConversation]);

  // Auto-save draft message (if enabled)
  useEffect(() => {
    if (enableAutoSave && currentConversation) {
      const timeoutId = setTimeout(() => {
        // Save draft to localStorage or session storage
        const key = `chatbot-draft-${currentConversation.conversationId}`;
        if (inputMessage.trim()) {
          localStorage.setItem(key, inputMessage);
        } else {
          localStorage.removeItem(key);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [inputMessage, currentConversation, enableAutoSave]);

  // Load draft message when conversation changes
  useEffect(() => {
    if (enableAutoSave && currentConversation) {
      const key = `chatbot-draft-${currentConversation.conversationId}`;
      const draft = localStorage.getItem(key);
      if (draft) {
        setInputMessage(draft);
      }
    }
  }, [currentConversation, enableAutoSave]);

  return {
    // Context data
    currentConversation,
    messages,
    filteredMessages,
    conversations,

    // Loading states
    isLoading,
    isSending,
    isTyping,

    // Error states
    error: error || messageError,

    // Input management
    inputMessage,
    setInputMessage,

    // Quick actions
    sendQuickMessage,
    sendCurrentMessage,
    clearInput,

    // Conversation management
    startFreshConversation,
    switchToConversation,
    endCurrentChat,

    // Message utilities
    getLastAgentMessage,
    getLastUserMessage,
    loadAllMessages,
    scrollToBottom,

    // Feedback helpers
    rateLastMessage,
    escalateCurrentConversation,

    // Search and filtering
    searchMessages,
    filterByType,
    clearSearch,

    // Utility functions
    retry,
    clearAllErrors,
    refreshConversations,

    // Keyboard support
    handleKeyPress,

    // Refs
    messagesEndRef
  };
}

export default useChatBotHook;
