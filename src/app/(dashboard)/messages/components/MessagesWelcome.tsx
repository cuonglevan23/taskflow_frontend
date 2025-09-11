import React from 'react';
import { DARK_THEME, THEME_COLORS, SEMANTIC_COLORS } from '@/constants/theme';

interface MessagesWelcomeProps {
  onStartConversation: () => void;
  onBrowseTeamMembers: () => void;
  stats?: {
    conversations: number;
    unread: number;
    teamChats: number;
  };
}

export const MessagesWelcome = ({
  onStartConversation,
  onBrowseTeamMembers,
  stats = { conversations: 0, unread: 0, teamChats: 0 }
}: MessagesWelcomeProps) => {
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: DARK_THEME.background.primary }}>
      {/* Welcome/Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Message Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${SEMANTIC_COLORS.message}20` }}>
            <svg className="w-10 h-10" style={{ color: SEMANTIC_COLORS.message }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          {/* Welcome Text */}
          <h2 className="text-2xl font-semibold mb-2" style={{ color: DARK_THEME.text.primary }}>
            Welcome to Messages
          </h2>
          <p className="mb-8" style={{ color: DARK_THEME.text.secondary }}>
            Stay connected with your team. Start a conversation to collaborate effectively.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onStartConversation}
              className="w-full inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: THEME_COLORS.primary[500],
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = THEME_COLORS.primary[600];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = THEME_COLORS.primary[500];
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start New Conversation
            </button>

            <button
              onClick={onBrowseTeamMembers}
              className="w-full inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-colors border"
              style={{
                backgroundColor: 'transparent',
                color: DARK_THEME.text.secondary,
                borderColor: DARK_THEME.border.default
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
                e.currentTarget.style.color = DARK_THEME.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = DARK_THEME.text.secondary;
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Browse Team Members
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="py-3">
              <div className="text-2xl font-bold" style={{ color: SEMANTIC_COLORS.message }}>
                {stats.conversations}
              </div>
              <div className="text-xs" style={{ color: DARK_THEME.text.muted }}>
                Conversations
              </div>
            </div>
            <div className="py-3">
              <div className="text-2xl font-bold" style={{ color: THEME_COLORS.success[500] }}>
                {stats.unread}
              </div>
              <div className="text-xs" style={{ color: DARK_THEME.text.muted }}>
                Unread
              </div>
            </div>
            <div className="py-3">
              <div className="text-2xl font-bold" style={{ color: SEMANTIC_COLORS.team }}>
                {stats.teamChats}
              </div>
              <div className="text-xs" style={{ color: DARK_THEME.text.muted }}>
                Team Chats
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesWelcome;
