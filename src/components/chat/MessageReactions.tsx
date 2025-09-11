"use client";

import React, { memo, useState, useCallback } from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import { ReactionType, REACTION_EMOJIS, MessageReaction } from '@/types/chat';

interface MessageReactionsProps {
  messageId: number;
  reactions?: MessageReaction['updatedSummary'];
  currentUserId?: number;
  onToggleReaction: (messageId: number, reactionType: ReactionType) => void;
  disabled?: boolean;
}

const MessageReactions = memo(({
  messageId,
  reactions,
  currentUserId,
  onToggleReaction,
  disabled = false
}: MessageReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Get available reaction types
  const availableReactions = Object.values(ReactionType);

  // Handle reaction click
  const handleReactionClick = useCallback((reactionType: ReactionType) => {
    if (disabled) return;
    onToggleReaction(messageId, reactionType);
    setShowPicker(false);
  }, [messageId, onToggleReaction, disabled]);

  // Check if current user has reacted with specific type
  const hasUserReacted = useCallback((reactionType: ReactionType) => {
    return reactions?.currentUserReactions?.includes(reactionType) || false;
  }, [reactions?.currentUserReactions]);

  // Get reaction count for specific type
  const getReactionCount = useCallback((reactionType: ReactionType) => {
    return reactions?.reactionCounts?.[reactionType] || 0;
  }, [reactions?.reactionCounts]);

  // Get users who reacted with specific type
  const getReactionUsers = useCallback((reactionType: ReactionType) => {
    return reactions?.reactionUsers?.[reactionType] || [];
  }, [reactions?.reactionUsers]);

  // Filter reactions that have counts > 0
  const activeReactions = availableReactions.filter(type => getReactionCount(type) > 0);

  if (!reactions || !reactions.hasReactions) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={disabled}
          className="p-1 rounded-full hover:bg-opacity-20 transition-all duration-200 disabled:opacity-50"
          style={{
            backgroundColor: showPicker ? `${THEME_COLORS.primary[500]}20` : 'transparent'
          }}
          title="Add reaction"
        >
          <span className="text-sm">😊</span>
        </button>

        {/* Reaction Picker */}
        {showPicker && (
          <div
            className="absolute bottom-full left-0 mb-2 p-2 rounded-lg border shadow-lg z-50 flex gap-1"
            style={{
              backgroundColor: DARK_THEME.background.secondary,
              borderColor: DARK_THEME.border.default
            }}
          >
            {availableReactions.map((reactionType) => (
              <button
                key={reactionType}
                onClick={() => handleReactionClick(reactionType)}
                className="p-2 rounded-md hover:bg-opacity-20 transition-all duration-200"
                style={{
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${THEME_COLORS.primary[500]}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={reactionType.toLowerCase()}
              >
                <span className="text-lg">{REACTION_EMOJIS[reactionType]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1 mt-1 flex-wrap">
        {/* Existing Reactions */}
        {activeReactions.map((reactionType) => {
          const count = getReactionCount(reactionType);
          const users = getReactionUsers(reactionType);
          const userReacted = hasUserReacted(reactionType);

          return (
            <button
              key={reactionType}
              onClick={() => handleReactionClick(reactionType)}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: userReacted
                  ? `${THEME_COLORS.primary[500]}20`
                  : DARK_THEME.background.muted,
                borderColor: userReacted
                  ? THEME_COLORS.primary[500]
                  : DARK_THEME.border.default,
                border: '1px solid',
                color: userReacted
                  ? THEME_COLORS.primary[500]
                  : DARK_THEME.text.secondary
              }}
              onMouseEnter={() => setShowDetails(true)}
              onMouseLeave={() => setShowDetails(false)}
              title={users.map(u => u.userName).join(', ')}
            >
              <span>{REACTION_EMOJIS[reactionType]}</span>
              <span className="font-medium">{count}</span>
            </button>
          );
        })}

        {/* Add Reaction Button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={disabled}
          className="p-1 rounded-full hover:bg-opacity-20 transition-all duration-200 disabled:opacity-50"
          style={{
            backgroundColor: showPicker ? `${THEME_COLORS.primary[500]}20` : 'transparent'
          }}
          title="Add reaction"
        >
          <span className="text-sm opacity-60">➕</span>
        </button>
      </div>

      {/* Reaction Picker */}
      {showPicker && (
        <div
          className="absolute bottom-full left-0 mb-2 p-2 rounded-lg border shadow-lg z-50 flex gap-1"
          style={{
            backgroundColor: DARK_THEME.background.secondary,
            borderColor: DARK_THEME.border.default
          }}
        >
          {availableReactions.map((reactionType) => {
            const userReacted = hasUserReacted(reactionType);

            return (
              <button
                key={reactionType}
                onClick={() => handleReactionClick(reactionType)}
                className="p-2 rounded-md transition-all duration-200"
                style={{
                  backgroundColor: userReacted
                    ? `${THEME_COLORS.primary[500]}20`
                    : 'transparent',
                  borderColor: userReacted
                    ? THEME_COLORS.primary[500]
                    : 'transparent',
                  border: '1px solid'
                }}
                onMouseEnter={(e) => {
                  if (!userReacted) {
                    e.currentTarget.style.backgroundColor = `${THEME_COLORS.primary[500]}10`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!userReacted) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={reactionType.toLowerCase()}
              >
                <span className="text-lg">{REACTION_EMOJIS[reactionType]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reaction Details Tooltip */}
      {showDetails && activeReactions.length > 0 && (
        <div
          className="absolute bottom-full left-0 mb-2 p-3 rounded-lg border shadow-lg z-50 max-w-xs"
          style={{
            backgroundColor: DARK_THEME.background.secondary,
            borderColor: DARK_THEME.border.default
          }}
        >
          <div className="space-y-2">
            {activeReactions.map((reactionType) => {
              const users = getReactionUsers(reactionType);
              if (users.length === 0) return null;

              return (
                <div key={reactionType} className="flex items-start gap-2">
                  <span className="text-lg">{REACTION_EMOJIS[reactionType]}</span>
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {users.slice(0, 3).map((user) => (
                        <span
                          key={user.userId}
                          className="text-xs"
                          style={{ color: DARK_THEME.text.primary }}
                        >
                          {user.userName}
                        </span>
                      ))}
                      {users.length > 3 && (
                        <span
                          className="text-xs"
                          style={{ color: DARK_THEME.text.muted }}
                        >
                          and {users.length - 3} others
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

MessageReactions.displayName = 'MessageReactions';

export default MessageReactions;
