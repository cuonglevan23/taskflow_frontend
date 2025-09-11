// Typing Indicator Component
'use client';

import React from 'react';
import { TypingIndicator as TypingIndicatorType } from '@/types/chat';
import { DARK_THEME } from '@/constants/theme';

interface TypingIndicatorProps {
  typingUsers: string[];
  isGroupChat?: boolean;
  className?: string;
}

function TypingIndicator({
  typingUsers,
  isGroupChat = false,
  className = ''
}: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  // Format typing text based on number of users
  const getTypingText = (): string => {
    if (typingUsers.length === 1) {
      return isGroupChat
        ? `${typingUsers[0]} đang gõ...`
        : 'Đang gõ...';
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} và ${typingUsers[1]} đang gõ...`;
    } else {
      return `${typingUsers[0]} và ${typingUsers.length - 1} người khác đang gõ...`;
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`} style={{ color: DARK_THEME.text.muted }}>
      {/* Animated typing dots - Dark Theme */}
      <div className="flex gap-1">
        <div
          className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]"
          style={{ backgroundColor: DARK_THEME.text.muted }}
        ></div>
        <div
          className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]"
          style={{ backgroundColor: DARK_THEME.text.muted }}
        ></div>
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ backgroundColor: DARK_THEME.text.muted }}
        ></div>
      </div>

      {/* Typing text */}
      <span className="italic">{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;
