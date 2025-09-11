import React from 'react';
import { DARK_THEME } from '@/constants/theme';

interface MessageActionsProps {
  isVisible: boolean;
  onReactionClick: () => void;
  onReplyClick: () => void;
  isOwn: boolean;
  reactionButtonRef: React.RefObject<HTMLButtonElement>;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isVisible,
  onReactionClick,
  onReplyClick,
  isOwn,
  reactionButtonRef
}) => {
  return (
    <div
      className={`absolute flex items-center gap-1 transition-all duration-200 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      } ${isOwn ? 'left-[-60px]' : 'right-[-60px]'}`}
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10
      }}
    >
      {/* Reaction Button */}
      <button
        ref={reactionButtonRef}
        onClick={onReactionClick}
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
        style={{
          backgroundColor: DARK_THEME.background.primary,
          border: `1px solid ${DARK_THEME.border.default}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        title="Add reaction"
      >
        <svg
          className="w-4 h-4"
          style={{ color: DARK_THEME.text.secondary }}
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
          backgroundColor: DARK_THEME.background.primary,
          border: `1px solid ${DARK_THEME.border.default}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        title="Reply"
      >
        <svg
          className="w-4 h-4"
          style={{ color: DARK_THEME.text.secondary }}
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
