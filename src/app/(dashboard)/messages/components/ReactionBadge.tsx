import React from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import { ReactionType, REACTION_EMOJIS } from '@/types/chat';

// Định dạng chính xác của reaction data theo API docs
interface ReactionData {
  messageId?: number;
  reactionCounts?: Record<ReactionType, number>;
  reactionUsers?: Record<ReactionType, {
    userId: number;
    userName: string;
    userAvatar?: string;
    reactedAt: string;
  }[]>;
  currentUserReactions?: ReactionType[];
  totalReactions?: number;
  hasReactions?: boolean;
  // Có thể là một phần của response toggle
  updatedSummary?: {
    messageId: number;
    reactionCounts: Record<ReactionType, number>;
    reactionUsers: Record<ReactionType, {
      userId: number;
      userName: string;
      userAvatar?: string;
      reactedAt: string;
    }[]>;
    currentUserReactions: ReactionType[];
    totalReactions: number;
    hasReactions: boolean;
  };
}

interface ReactionBadgeProps {
  reactions?: ReactionData | any;
  currentUserId?: number;
  onToggleReaction: (reactionType: ReactionType) => void;
  isOwn?: boolean;
  messageId?: number;
}

export const ReactionBadge: React.FC<ReactionBadgeProps> = ({
  reactions,
  currentUserId,
  onToggleReaction,
  isOwn = false,
  messageId
}) => {
  // Kiểm tra nếu không có reaction data
  if (!reactions) {
    return null;
  }

  // Xử lý 2 dạng dữ liệu: trực tiếp hoặc nested trong updatedSummary
  const reactionData = reactions.updatedSummary || reactions;

  // Trích xuất dữ liệu theo đúng format API
  const reactionCounts = reactionData.reactionCounts || {};
  const currentUserReactions = reactionData.currentUserReactions || [];
  const totalReactions = reactionData.totalReactions || 0;
  const hasReactions = !!reactionData.hasReactions;

  // Nếu không có reactions, return null - improved logic
  const hasAnyReactionCounts = reactionCounts && Object.values(reactionCounts).some(count => Number(count) > 0);

  if (!hasAnyReactionCounts && totalReactions === 0) {
    return null;
  }

  // Convert reaction counts thành array của active reactions
  const activeReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => Number(count) > 0)
    .map(([reactionType, count]) => ({
      type: reactionType as ReactionType,
      count: Number(count),
      emoji: REACTION_EMOJIS[reactionType as ReactionType] || '👍',
      isUserReacted: currentUserReactions.includes(reactionType as ReactionType)
    }))
    // Sort để đưa reaction của user lên đầu, và sort theo số lượng
    .sort((a, b) => {
      // User reactions first
      if (a.isUserReacted !== b.isUserReacted) {
        return a.isUserReacted ? -1 : 1;
      }
      // Then by count (descending)
      return b.count - a.count;
    });

  if (activeReactions.length === 0) {
    return null;
  }

  // Chỉ hiển thị tối đa 3 reactions phổ biến nhất, còn lại gộp vào số total
  const displayReactions = activeReactions.slice(0, 3);

  // Hiển thị reaction badge với positioning chính xác kiểu Messenger
  return (
    <div
      className="absolute"
      style={{
        position: 'absolute', // Ensure absolute positioning
        bottom: '-9px', // Position exactly at the bottom edge of the message bubble
        [isOwn ? 'right' : 'left']: isOwn ? '10px' : '10px', // Aligned with message bubble edge
      }}
    >
      <div
        className="flex items-center gap-0.5 rounded-full px-1"
        style={{
          background: DARK_THEME.background.primary,
          border: `1px solid ${DARK_THEME.border.default}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          height: '18px', // More compact like Messenger
          transform: 'translateY(0)', // No vertical translation needed
        }}
      >
        {displayReactions.map(({ type, emoji, isUserReacted }) => (
          <button
            key={type}
            onClick={() => onToggleReaction(type)}
            className="flex items-center justify-center transition-transform duration-150 hover:scale-110"
            style={{
              padding: '0px',
              margin: '0 1px',
              background: 'transparent',
              transform: isUserReacted ? 'scale(1.1)' : 'scale(1)',
            }}
            title={`${type}`}
          >
            <span style={{ lineHeight: 1, fontSize: '11px' }}>{emoji}</span>
          </button>
        ))}

        {totalReactions > 1 && (
          <span
            className="ml-0.5 mr-0.5 font-medium"
            style={{
              color: DARK_THEME.text.secondary,
              fontSize: '10px',
              lineHeight: 1
            }}
          >
            {totalReactions}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReactionBadge;
