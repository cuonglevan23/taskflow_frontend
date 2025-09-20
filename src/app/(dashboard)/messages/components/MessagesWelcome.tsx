import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface MessagesStats {
  conversations: number;
  unread: number;
  teamChats: number;
}

interface MessagesWelcomeProps {
  onStartConversation: () => void;
  onBrowseTeamMembers: () => void;
  stats?: MessagesStats;
}

export const MessagesWelcome = ({
  onStartConversation,
  onBrowseTeamMembers,
  stats = { conversations: 0, unread: 0, teamChats: 0 }
}: MessagesWelcomeProps) => {
  // Theme and Language Context
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: theme.background.primary }}>
      {/* Welcome/Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Message Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.status.info}20` }}>
            <svg className="w-10 h-10" style={{ color: theme.status.info }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          {/* Welcome Text */}
          <h2 className="text-2xl font-semibold mb-2" style={{ color: theme.text.primary }}>
            {messages?.chat?.title || 'Welcome to Messages'}
          </h2>
          <p className="mb-8" style={{ color: theme.text.secondary }}>
            {messages?.chat?.sidebar?.startConversation || 'Stay connected with your team. Start a conversation to collaborate effectively.'}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onStartConversation}
              className="w-full inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: theme.status.info,
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.status.info;
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.status.info;
                e.currentTarget.style.opacity = '1';
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {messages?.chat?.startNewConversation || 'Start new conversation'}
            </button>

            <button
              onClick={onBrowseTeamMembers}
              className="w-full inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg border transition-colors"
              style={{
                backgroundColor: 'transparent',
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.weakHover || theme.background.muted;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {messages?.chat?.contacts?.title || 'Browse team members'}
            </button>
          </div>

          {/* Stats */}
          {(stats.conversations > 0 || stats.unread > 0 || stats.teamChats > 0) && (
            <div className="mt-8 pt-6 border-t" style={{ borderColor: theme.border.muted }}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                    {stats.conversations}
                  </div>
                  <div className="text-xs" style={{ color: theme.text.muted }}>
                    {messages?.chat?.sidebar?.conversations || 'Conversations'}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                    {stats.unread}
                  </div>
                  <div className="text-xs" style={{ color: theme.text.muted }}>
                    {messages?.chat?.sidebar?.filters?.unread || 'Unread'}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                    {stats.teamChats}
                  </div>
                  <div className="text-xs" style={{ color: theme.text.muted }}>
                    {messages?.chat?.sidebar?.filters?.teams || 'Team Chats'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesWelcome;
