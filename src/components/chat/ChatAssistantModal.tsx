"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import { useChatBotHook } from '@/hooks/useChatBot';
import { X, Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { AI_COPILOT_COLORS } from '@/constants/theme';

interface ChatAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function ChatAssistantModal({ isOpen, onClose, triggerButtonRef }: ChatAssistantModalProps) {
  const { theme } = useThemeContext();
  const { messages: i18nMessages } = useLanguageContext();

  // Use real ChatBot hook instead of mock data
  const {
    // Messages and conversation state
    messages,
    filteredMessages,
    currentConversation,

    // Loading states
    isLoading,
    isSending,
    isTyping,

    // Error states
    error,

    // Input management
    inputMessage,
    setInputMessage,

    // Actions
    sendCurrentMessage,
    startFreshConversation,
    clearInput,
    clearAllErrors,
    loadAllMessages,

    // Utilities
    handleKeyPress,
    messagesEndRef,
    scrollToBottom
  } = useChatBotHook({
    autoScroll: true,
    maxRetries: 3,
    enableAutoSave: true
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState({ x: 0, y: 0 });
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = i18nMessages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerButtonRef?.current) {
      // Get position of trigger button
      const rect = triggerButtonRef.current.getBoundingClientRect();
      setTriggerPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
      setIsAnimating(true);

      // End animation after delay
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, triggerButtonRef]);

  // Load messages once when modal opens
  useEffect(() => {
    if (isOpen && !hasLoadedMessages) {
      const loadExistingMessages = async () => {
        try {
          console.log('🔄 Loading existing chat messages...');

          const hasExistingMessages = await loadAllMessages();

          if (hasExistingMessages) {
            console.log('✅ Found and loaded existing messages');
            setHasLoadedMessages(true);
            return;
          }

          console.log('📝 No existing messages, starting fresh conversation');

          // Only start new conversation if we don't have any conversation or messages
          if (!currentConversation && messages.length === 0) {
            console.log('🆕 Starting new conversation...');
            await startFreshConversation();
          }

          setHasLoadedMessages(true);
        } catch (error) {
          console.error('❌ Failed to load existing messages:', error);
          setHasLoadedMessages(true); // Prevent retry loop
        }
      };

      loadExistingMessages();
    }
  }, [isOpen]); // Only depend on isOpen to prevent infinite loop

  // Reset hasLoadedMessages when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasLoadedMessages(false);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    try {
      await sendCurrentMessage();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clearInput();
    }
  };

  const handleRetry = () => {
    clearAllErrors();
    if (inputMessage.trim()) {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Full screen overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] transition-opacity duration-300"
        style={{ pointerEvents: 'auto' }}
      />

      {/* Animated Icon - Flies from trigger to modal */}
      {isAnimating && (
        <div
          className="fixed z-[102] pointer-events-none"
          style={{
            left: triggerPosition.x - 12,
            top: triggerPosition.y - 12,
            animation: 'flyToModal 0.5s ease-out forwards'
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${AI_COPILOT_COLORS.avatarBackground1}, ${AI_COPILOT_COLORS.avatarBackground2})`
            }}
          >
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Chat Modal Container - Positioned over backdrop */}
      <div className="fixed inset-0 z-[101] pointer-events-none">
        <div
          className={`fixed bottom-4 right-4 pointer-events-auto transition-all duration-300 ${
            isAnimating
              ? 'opacity-0 scale-50 translate-y-4'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{
            animationDelay: isAnimating ? '0.3s' : '0s'
          }}
        >
          <div
            className="w-96 h-[500px] rounded-xl shadow-2xl border flex flex-col overflow-hidden"
            style={{
              backgroundColor: theme.background.primary,
              borderColor: theme.border.default
            }}
          >
            {/* Header */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${AI_COPILOT_COLORS.avatarBackground1}, ${AI_COPILOT_COLORS.avatarBackground2})`,
                borderColor: theme.border.default
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white">TaskFlow Assistant</h3>
                  <p className="text-xs text-white/80">
                    {currentConversation ? 'Đang hoạt động' : 'Đang kết nối...'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-red-50 border-b border-red-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading && messages.length === 0 ? (
                // Loading state for initial conversation
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                    <p className="text-sm text-gray-500">Đang khởi tạo cuộc trò chuyện...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Welcome message if no messages yet */}
                  {messages.length === 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div
                          className="inline-block p-3 rounded-lg rounded-bl-sm max-w-[80%]"
                          style={{
                            backgroundColor: theme.background.secondary,
                            color: theme.text.primary
                          }}
                        >
                          <p className="text-sm leading-relaxed">
                            Xin chào! Tôi là trợ lý ảo TaskFlow. Tôi có thể giúp bạn quản lý công việc, tạo task, hoặc trả lời các câu hỏi về ứng dụng. Bạn cần hỗ trợ gì?
                          </p>
                        </div>
                        <p
                          className="text-xs mt-1 opacity-60"
                          style={{ color: theme.text.muted }}
                        >
                          {new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Real messages from ChatBot service */}
                  {messages.map((message) => (
                    <div
                      key={message.messageId}
                      className={`flex items-start space-x-3 ${
                        message.senderType === 'USER' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.senderType === 'AGENT' 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}
                      >
                        {message.senderType === 'AGENT' ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`flex-1 ${message.senderType === 'USER' ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            message.senderType === 'USER'
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'rounded-bl-sm'
                          } ${message.isError ? 'border border-red-300' : ''}`}
                          style={{
                            backgroundColor: message.senderType === 'USER'
                              ? '#3B82F6'
                              : theme.background.secondary,
                            color: message.senderType === 'USER'
                              ? 'white'
                              : theme.text.primary
                          }}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          {message.isError && (
                            <p className="text-xs mt-1 text-red-200">
                              Không thể gửi tin nhắn. Nhấn "Thử lại" để gửi lại.
                            </p>
                          )}
                          {message.isLoading && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span className="text-xs opacity-70">Đang gửi...</span>
                            </div>
                          )}
                        </div>
                        <p
                          className="text-xs mt-1 opacity-60"
                          style={{ color: theme.text.muted }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div
                        className="p-3 rounded-lg rounded-bl-sm"
                        style={{ backgroundColor: theme.background.secondary }}
                      >
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="p-4 border-t"
              style={{ borderColor: theme.border.default }}
            >
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn..."
                  disabled={isSending || isLoading}
                  className="flex-1 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.default,
                    color: theme.text.primary
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSending || isLoading}
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>


    </>
  );
}
