import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Send } from 'lucide-react';
import { ChatWindow, ChatMessage } from '@/types/chat';
import { DARK_THEME } from '@/constants/theme';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { useAuth } from '@/components/auth/AuthProvider';

interface MiniChatWindowProps {
  window: ChatWindow;
  messages: ChatMessage[];
  onClose: () => void;
  onMinimize: () => void;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  isOnline?: boolean;
  typingUsers?: string[];
}

export function MiniChatWindow({
  window,
  messages,
  onClose,
  onMinimize,
  onSendMessage,
  onTyping,
  isOnline = false,
  typingUsers = []
}: MiniChatWindowProps) {
  // Get current user info directly from AuthProvider
  const { user: currentUser } = useAuth();

  const [messageInput, setMessageInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Auto scroll to bottom when new messages arrive or window opens
  useEffect(() => {
    if (messages.length > 0) {
      console.log('📜 Scrolling to bottom, messages count:', messages.length);
      // Delay scroll để đảm bảo DOM đã render xong
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]);

  // Focus input when window opens and scroll to bottom
  useEffect(() => {
    if (!window.isMinimized) {

      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }

      // Scroll to bottom when window opens
      if (messages.length > 0) {
        setTimeout(() => {
          scrollToBottom();
        }, 200);
      }
    }
  }, [window.isMinimized]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {

      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('💬 Sending message:', messageInput);
      onSendMessage(messageInput.trim());
      setMessageInput('');
      onTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (window.isMinimized) {
    return (
      <div
        className="w-64 rounded-t-lg shadow-lg cursor-pointer"
        style={{
          backgroundColor: DARK_THEME.background.secondary,
          borderColor: DARK_THEME.border.default,
          border: `1px solid ${DARK_THEME.border.default}`,
          zIndex: Math.max(10000, window.zIndex || 10000),
        }}
        onClick={onMinimize}
      >
        <div
          className="flex items-center justify-between p-3 rounded-t-lg"
          style={{
            backgroundColor: DARK_THEME.background.tertiary,
            color: DARK_THEME.text.primary
          }}
        >
          <div className="flex items-center">
            <UserAvatar
              name={`${window.user.firstName} ${window.user.lastName}`}
              avatar={window.user.avatarUrl}
              size="sm"
              variant="circle"
              className="mr-2"
            />
            <div>
              <div className="font-medium text-sm" style={{ color: DARK_THEME.text.primary }}>
                {window.user.firstName} {window.user.lastName}
              </div>
              {isOnline && (
                <div className="text-xs opacity-80" style={{ color: DARK_THEME.text.secondary }}>Online</div>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded p-1 hover:bg-opacity-20"
            style={{
              color: DARK_THEME.text.primary,
              ':hover': { backgroundColor: DARK_THEME.background.muted }
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg shadow-2xl"
      style={{
        width: '350px',
        height: '500px',
        backgroundColor: DARK_THEME.background.primary,
        borderColor: DARK_THEME.border.default,
        border: `1px solid ${DARK_THEME.border.default}`,
        zIndex: Math.max(10000, window.zIndex || 10000),
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Header */}
      <div
        className="chat-header flex items-center justify-between p-3 rounded-t-lg cursor-move"
        style={{
          backgroundColor: DARK_THEME.background.tertiary,
          color: DARK_THEME.text.primary
        }}
      >
        <div className="flex items-center">
          <UserAvatar
            name={`${window.user.firstName} ${window.user.lastName}`}
            avatar={window.user.avatarUrl}
            size="sm"
            variant="circle"
            className="mr-3"
          />
          <div>
            <div className="font-medium" style={{ color: DARK_THEME.text.primary }}>
              {window.user.firstName} {window.user.lastName}
            </div>
            <div className="text-xs opacity-80" style={{ color: DARK_THEME.text.secondary }}>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onMinimize}
            className="rounded p-1"
            style={{
              color: DARK_THEME.text.primary,
              ':hover': { backgroundColor: DARK_THEME.background.muted }
            }}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded p-1"
            style={{
              color: DARK_THEME.text.primary,
              ':hover': { backgroundColor: DARK_THEME.background.muted }
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area - DARK THEME */}
      <div
        className="flex flex-col overflow-hidden"
        style={{
          height: 'calc(500px - 60px - 70px)',
          maxHeight: 'calc(500px - 60px - 70px)',
          backgroundColor: DARK_THEME.background.primary
        }}
      >
        <div
          className="flex-1 overflow-y-auto p-3 space-y-2"
          style={{
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: DARK_THEME.background.primary
          }}
          id={`messages-container-${window.key}`}
        >
          {!messages || messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center" style={{ color: DARK_THEME.text.muted }}>
                <div className="text-sm">No messages yet</div>
                <div className="text-xs mt-1">Start a conversation!</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Debug info - dark theme */}
              {process.env.NODE_ENV === 'development' && (
                <div
                  className="text-xs p-2 rounded"
                  style={{
                    color: DARK_THEME.text.muted,
                    backgroundColor: DARK_THEME.background.secondary
                  }}
                >
                  Messages: {messages.length} | Current User ID: {currentUser?.id}
                </div>
              )}

              {/* Render all messages with dark theme */}
              {messages.map((message, index) => {
                const currentUserId = currentUser?.id ? parseInt(String(currentUser.id), 10) : null;
                const messageSenderId = message.senderId ? parseInt(String(message.senderId), 10) : null;
                const isOwnMessage = currentUserId && messageSenderId && currentUserId === messageSenderId;

                return (
                  <div
                    key={`${message.id}-${index}`}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    {isOwnMessage ? (
                      // Own message - right side with dark theme
                      <>
                        <div className="max-w-[70%] mr-2">
                          <div
                            className="px-3 py-2 rounded-2xl text-sm rounded-bl-md break-words"
                            style={{
                              backgroundColor: DARK_THEME.background.tertiary,
                              color: DARK_THEME.text.primary
                            }}
                          >
                            {message.content || 'Empty message'}
                          </div>
                          <div className="text-xs mt-1 text-right" style={{ color: DARK_THEME.text.muted }}>
                            {message.createdAt ? formatTime(message.createdAt) : 'Now'}
                          </div>
                        </div>
                        <div className="w-6 h-6 flex-shrink-0">
                          <UserAvatar
                            name={message.senderName || "You"}
                            avatar={message.senderAvatar}
                            size="xs"
                            variant="circle"
                          />
                        </div>
                      </>
                    ) : (
                      // Other's message - left side with dark theme
                      <>
                        <div className="w-6 h-6 flex-shrink-0 mr-2">
                          <UserAvatar
                            name={message.senderName || "Unknown"}
                            avatar={message.senderAvatar}
                            size="xs"
                            variant="circle"
                          />
                        </div>
                        <div className="max-w-[70%]">
                          <div
                            className="px-3 py-2 rounded-2xl text-sm rounded-br-md break-words"
                            style={{
                              backgroundColor: DARK_THEME.background.secondary,
                              color: DARK_THEME.text.primary
                            }}
                          >
                            {message.content || 'Empty message'}
                          </div>
                          <div className="text-xs mt-1 text-left" style={{ color: DARK_THEME.text.muted }}>
                            {message.createdAt ? formatTime(message.createdAt) : 'Now'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator - dark theme */}
              {typingUsers && typingUsers.length > 0 && (
                <div className="flex items-center text-sm mt-2" style={{ color: DARK_THEME.text.muted }}>
                  <div className="flex space-x-1 mr-2">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: DARK_THEME.text.muted }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: DARK_THEME.text.muted, animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: DARK_THEME.text.muted, animationDelay: '0.2s' }}></div>
                  </div>
                  <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              )}

              {/* Scroll anchor */}
              <div
                ref={messagesEndRef}
                style={{ height: '10px', width: '100%', minHeight: '10px' }}
                className="scroll-anchor"
              />
            </div>
          )}
        </div>
      </div>

      {/* Message Input - Dark Theme */}
      <div
        className="p-3"
        style={{
          borderTop: `1px solid ${DARK_THEME.border.default}`,
          backgroundColor: DARK_THEME.background.primary
        }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full px-3 py-2 rounded-full focus:outline-none text-sm"
              style={{
                backgroundColor: DARK_THEME.background.secondary,
                borderColor: DARK_THEME.border.default,
                border: `1px solid ${DARK_THEME.border.default}`,
                color: DARK_THEME.text.primary,
                ':focus': {
                  borderColor: DARK_THEME.border.focus
                }
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: messageInput.trim() ? DARK_THEME.background.tertiary : DARK_THEME.background.muted,
              color: DARK_THEME.text.primary
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
};
