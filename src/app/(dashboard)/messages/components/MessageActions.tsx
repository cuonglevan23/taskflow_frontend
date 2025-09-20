import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface MessageActionsProps {
  onReactionClick: () => void;
  onReplyClick: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  onReactionClick,
  onReplyClick
}) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  return (
    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* React Button */}
      <button
        onClick={onReactionClick}
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
        style={{
          backgroundColor: theme.background.primary,
          border: `1px solid ${theme.border.default}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        title={messages?.chat?.addReaction || 'Add reaction'}
      >
        <svg
          className="w-4 h-4"
          style={{ color: theme.text.secondary }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
        </svg>
      </button>

      {/* Reply Button */}
      <button
        onClick={onReplyClick}
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
        style={{
          backgroundColor: theme.background.primary,
          border: `1px solid ${theme.border.default}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        title={messages?.chat?.reply || 'Reply'}
      >
        <svg
          className="w-4 h-4"
          style={{ color: theme.text.secondary }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
        </svg>
      </button>
    </div>
  );
};

export default MessageActions;
