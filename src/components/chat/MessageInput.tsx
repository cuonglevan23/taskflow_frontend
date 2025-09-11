// Message Input Component with Typing Detection
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { DARK_THEME } from '@/constants/theme';

interface MessageInputProps {
  onSendMessage: (content: string, replyToId?: number) => Promise<void>;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function MessageInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  placeholder = 'Nhập tin nhắn...',
  disabled = false,
  className = ''
}: MessageInputProps) {
  const [message, setMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = (): void => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // Handle typing detection
  const handleTyping = (): void => {
    if (!isTyping && onTypingStart) {
      setIsTyping(true);
      onTypingStart();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && onTypingStop) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 2000);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
    adjustTextareaHeight();

    if (e.target.value.trim() && !disabled) {
      handleTyping();
    }
  };

  // Handle send message
  const handleSend = async (): Promise<void> => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');

      // Stop typing
      if (isTyping && onTypingStop) {
        setIsTyping(false);
        onTypingStop();
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex items-end gap-3 p-4 ${className}`} style={{ backgroundColor: DARK_THEME.background.primary }}>
      {/* Message Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 rounded-2xl resize-none focus:outline-none focus:ring-2 min-h-[48px] max-h-[120px] ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
          style={{
            backgroundColor: disabled ? DARK_THEME.background.muted : DARK_THEME.background.secondary,
            borderColor: DARK_THEME.border.default,
            border: `1px solid ${DARK_THEME.border.default}`,
            color: DARK_THEME.text.primary,
            ':focus': {
              borderColor: DARK_THEME.border.focus,
              ringColor: DARK_THEME.border.focus
            }
          }}
          rows={1}
        />

        {/* Character count (optional) */}
        {message.length > 0 && (
          <div
            className="absolute bottom-1 right-1 text-xs px-1 rounded"
            style={{
              color: DARK_THEME.text.muted,
              backgroundColor: DARK_THEME.background.primary
            }}
          >
            {message.length}
          </div>
        )}
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
          message.trim() && !disabled
            ? 'hover:scale-95 active:scale-95'
            : 'cursor-not-allowed opacity-50'
        }`}
        style={{
          backgroundColor: message.trim() && !disabled
            ? DARK_THEME.background.tertiary
            : DARK_THEME.background.muted,
          color: DARK_THEME.text.primary,
          ':hover': {
            backgroundColor: message.trim() && !disabled
              ? DARK_THEME.background.muted
              : undefined
          }
        }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;
