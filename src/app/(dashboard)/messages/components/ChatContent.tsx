"use client";

import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import { ChatMessage, ChatUser, ReactionType } from '@/types/chat';
import { useReactions } from '@/hooks/chat/useReactions';
import { chatService } from '@/services/chat';
import { useThemeContext } from "@/providers/ThemeProvider";
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput/ChatInput';

interface ChatContentProps {
  conversation: {
    id: number;
    name: string;
    type: 'DIRECT' | 'GROUP';
    participants: ChatUser[];
    avatarUrl?: string;
    isOnline?: boolean;
    memberCount?: number; // Add memberCount property
  };
  messages: ChatMessage[];
  typingUsers: string[];
  currentUser?: ChatUser;
  isConnected: boolean;
  onSendMessage: (content: string, replyToId?: number) => void;
  onSendWithAttachments?: (content: string, files: File[], images: File[], replyToId?: number) => void;
  onTyping: (isTyping: boolean) => void;
}

export const ChatContent = memo(({
  conversation,
  messages,
  typingUsers,
  currentUser,
  isConnected,
  onSendMessage,
  onSendWithAttachments,
  onTyping
}: ChatContentProps) => {
  // Theme and Language Context
  const { theme } = useThemeContext();

  // State management
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [messagesWithReactions, setMessagesWithReactions] = useState<ChatMessage[]>(messages);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize reactions hook - remove unused toggleReaction
  const { } = useReactions();

  // Effect to load reactions for messages
  useEffect(() => {
    const fetchReactions = async () => {
      if (!messages || messages.length === 0 || !conversation.id) return;

      try {
        const messageIds = messages.map(msg => msg.id);
        const bulkReactions = await chatService.getBulkReactionSummaries(conversation.id, messageIds);

        if (bulkReactions && bulkReactions.messageReactions) {
          const updatedMessages = messages.map(msg => {
            const reactionData = bulkReactions.messageReactions[msg.id];
            if (reactionData && reactionData.hasReactions) {
              return {
                ...msg,
                reactions: {
                  messageId: msg.id,
                  reactionCounts: reactionData.reactionCounts || {},
                  reactionUsers: reactionData.reactionUsers || {},
                  currentUserReactions: reactionData.currentUserReactions || [],
                  totalReactions: reactionData.totalReactions || 0,
                  hasReactions: reactionData.hasReactions || false
                }
              };
            }
            return msg;
          });

          setMessagesWithReactions(updatedMessages);
        }
      } catch (error) {
        console.error('Failed to fetch reactions:', error);
      }
    };

    fetchReactions();
  }, [messages, conversation.id]);

  // Handle reaction toggle with immediate UI update
  const handleToggleReaction = useCallback(async (messageId: number, reactionType: ReactionType) => {
    try {
      const result = await chatService.toggleReaction(messageId, reactionType);

      if (result && result.updatedSummary) {
        setMessagesWithReactions(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageId
              ? { ...msg, reactions: result.updatedSummary }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  }, []);

  // Optimized scroll function
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  }, []);

  // Simplified scroll handler
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollToBottom(!isAtBottom);

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (isAtBottom) setShowScrollToBottom(false);
    }, 1000);
  }, []);

  // Auto scroll for new messages
  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(false), 100);
    return () => clearTimeout(timer);
  }, [conversation.id, messagesWithReactions.length, scrollToBottom]);

  // Input change handler with typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;

    // Typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1000);
  }, [isTyping, onTyping]);

  // Handle reply to message
  const handleReply = useCallback((message: ChatMessage) => {
    setReplyToMessage(message);
  }, []);

  // Cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  // Enhanced send message handler
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !isConnected) return;

    const messageContent = inputValue.trim();
    const replyId = replyToMessage?.id;

    onSendMessage(messageContent, replyId);

    // Reset state
    setInputValue('');
    setReplyToMessage(null);

    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setTimeout(() => scrollToBottom(false), 50);
  }, [inputValue, isConnected, onSendMessage, replyToMessage, isTyping, onTyping, scrollToBottom]);

  // Handle send with attachments
  const handleSendWithAttachments = useCallback((content: string, files: File[], images: File[]) => {
    if ((!content.trim() && files.length === 0 && images.length === 0) || !isConnected) return;

    const replyId = replyToMessage?.id;

    if (onSendWithAttachments) {
      onSendWithAttachments(content, files, images, replyId);
    } else {
      // Fallback to regular message if attachment handler not provided
      if (content.trim()) {
        onSendMessage(content, replyId);
      }
    }

    // Reset state
    setInputValue('');
    setReplyToMessage(null);

    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setTimeout(() => scrollToBottom(false), 50);
  }, [isConnected, onSendWithAttachments, onSendMessage, replyToMessage, isTyping, onTyping, scrollToBottom]);

  // Enhanced key down handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  }, [handleSendMessage]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: theme.background.primary }}>
      {/* Chat Header */}
      <ChatHeader
        conversation={conversation}
        currentUser={currentUser}
        isConnected={isConnected}
      />

      {/* Messages Area */}
      <ChatMessages
        messages={messagesWithReactions}
        typingUsers={typingUsers}
        currentUser={currentUser}
        showScrollToBottom={showScrollToBottom}
        onToggleReaction={handleToggleReaction}
        onReply={handleReply}
        onScrollToBottom={() => scrollToBottom(false)}
        onScroll={handleScroll}
        messagesEndRef={messagesEndRef}
        messagesContainerRef={messagesContainerRef}
      />

      {/* Chat Input with Attachments */}
      <ChatInput
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSendMessage={handleSendMessage}
        onSendWithAttachments={handleSendWithAttachments}
        replyToMessage={replyToMessage}
        onCancelReply={handleCancelReply}
        isConnected={isConnected}
      />
    </div>
  );
});

ChatContent.displayName = 'ChatContent';

export default ChatContent;
