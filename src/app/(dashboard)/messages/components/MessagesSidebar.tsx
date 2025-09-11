"use client";

import React from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import NewChatModal from './NewChatModal';

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline?: boolean;
}

interface MessagesSidebarProps {
  onSearchConversations: (query: string) => void;
  onFilterChange: (filter: 'all' | 'unread' | 'teams' | 'direct') => void;
  activeFilter: 'all' | 'unread' | 'teams' | 'direct';
  searchQuery?: string;
  onCreateChat?: (selectedContacts: Contact[]) => void;
}

export const MessagesSidebar = ({
  onSearchConversations,
  onFilterChange,
  activeFilter,
  searchQuery = '',
  onCreateChat
}: MessagesSidebarProps) => {
  const [localSearchQuery, setLocalSearchQuery] = React.useState<string>(searchQuery);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = React.useState(false);

  // Sync local state with external searchQuery changes
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    onSearchConversations(query);
  };

  const handleCreateChat = () => {
    setIsNewChatModalOpen(true);
  };

  const handleCloseNewChatModal = () => {
    setIsNewChatModalOpen(false);
  };

  const handleStartChat = (selectedContacts: Contact[]) => {
    if (onCreateChat) {
      onCreateChat(selectedContacts);
    }
    console.log('Starting chat with:', selectedContacts);
    // Logic will be handled by parent component
  };

  const filterOptions = [
    { key: 'all' as const, label: 'All' },
    { key: 'unread' as const, label: 'Unread' },
    { key: 'teams' as const, label: 'Teams' },
    { key: 'direct' as const, label: 'Direct' }
  ];

  return (
    <>
      <div className="w-80 border-r flex flex-col" style={{
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default
      }}>
        {/* Sidebar Header */}
        <div className="p-4 border-b" style={{ borderColor: DARK_THEME.border.default }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium" style={{ color: DARK_THEME.text.primary }}>
              Conversations
            </h2>
            <button
              onClick={handleCreateChat}
              className="p-1 rounded transition-colors"
              style={{
                color: DARK_THEME.text.muted,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
                e.currentTarget.style.color = DARK_THEME.text.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = DARK_THEME.text.muted;
              }}
              title="Create new chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Search Conversations */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{
                backgroundColor: DARK_THEME.search.background,
                color: DARK_THEME.search.text,
                borderColor: DARK_THEME.border.default,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.search.backgroundActive;
                e.currentTarget.style.borderColor = THEME_COLORS.primary[500];
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.search.background;
                e.currentTarget.style.borderColor = DARK_THEME.border.default;
              }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4" style={{ color: DARK_THEME.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Conversation Filters */}
        <div className="px-4 py-3 border-b" style={{ borderColor: DARK_THEME.border.default }}>
          <div className="flex space-x-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => onFilterChange(option.key)}
                className="px-3 py-1 text-xs font-medium rounded-full transition-colors"
                style={{
                  backgroundColor: activeFilter === option.key ? THEME_COLORS.primary[500] : 'transparent',
                  color: activeFilter === option.key ? '#ffffff' : DARK_THEME.text.muted
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== option.key) {
                    e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
                    e.currentTarget.style.color = DARK_THEME.text.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== option.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = DARK_THEME.text.muted;
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List Container - This will be filled by ConversationList component */}
        <div className="flex-1 overflow-y-auto">
          {/* ConversationList component will be rendered here by parent */}
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={handleCloseNewChatModal}
        onStartChat={handleStartChat}
      />
    </>
  );
};

export default MessagesSidebar;
