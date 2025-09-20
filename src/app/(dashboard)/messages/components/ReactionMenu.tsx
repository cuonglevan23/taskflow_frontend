import React, { useEffect, useRef } from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { ReactionType, REACTION_EMOJIS } from '@/types/chat';

interface ReactionMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onReactionSelect: (reactionType: ReactionType) => void;
  onClose: () => void;
}

export const ReactionMenu: React.FC<ReactionMenuProps> = ({
  isVisible,
  position,
  onReactionSelect,
  onClose
}) => {
  // Theme and Language Context
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 flex items-center gap-1 p-2 rounded-full transition-all duration-200 animate-in fade-in-0 zoom-in-95"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: theme.background.primary,
        border: `1px solid ${theme.border.default}`,
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
        transform: 'translateY(-50%)'
      }}
    >
      {Object.values(ReactionType).map((reactionType) => (
        <button
          key={reactionType}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReactionSelect(reactionType);
            onClose();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-200 hover:scale-125 hover:bg-opacity-10"
          style={{
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${theme.status.info}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title={messages?.chat?.reactions?.[reactionType] || reactionType}
        >
          {REACTION_EMOJIS[reactionType]}
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
