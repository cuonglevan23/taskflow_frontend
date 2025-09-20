"use client";

import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
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
  // Theme and Language Context
  const { theme, themeMode } = useThemeContext();
  const { messages } = useLanguageContext();

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
    { key: 'all' as const, label: messages?.chat?.sidebar?.filters?.all || 'All' },
    { key: 'unread' as const, label: messages?.chat?.sidebar?.filters?.unread || 'Unread' },
    { key: 'teams' as const, label: messages?.chat?.sidebar?.filters?.teams || 'Teams' },
    { key: 'direct' as const, label: messages?.chat?.sidebar?.filters?.direct || 'Direct' }
  ];

  return (
    <>
      <div className="w-80 border-r flex flex-col" style={{
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.default
      }}>
        {/* Sidebar Header */}
        <div className="p-4 border-b" style={{ borderColor: theme.border.default }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium" style={{ color: theme.text.primary }}>
              {messages?.chat?.sidebar?.conversations || 'Conversations'}
            </h2>
            <button
              onClick={handleCreateChat}
              className="p-1 rounded transition-colors"
              style={{
                color: theme.text.muted,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.sidebar.hover;
                e.currentTarget.style.color = theme.text.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.muted;
              }}
              title={messages?.chat?.sidebar?.createNewChat || 'Create new chat'}
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
              placeholder={messages?.chat?.sidebar?.searchPlaceholder || 'Search conversations...'}
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{
                backgroundColor: theme.search.background,
                color: theme.search.text,
                borderColor: theme.border.default,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = theme.search.backgroundActive;
                e.currentTarget.style.borderColor = theme.border.focus;
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = theme.search.background;
                e.currentTarget.style.borderColor = theme.border.default;
              }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4" style={{ color: theme.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Conversation Filters */}
        <div className="px-4 py-3 border-b" style={{ borderColor: theme.border.default }}>
          <div className="flex space-x-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => onFilterChange(option.key)}
                className="px-3 py-1 text-xs font-medium rounded-full transition-colors"
                style={{
                  backgroundColor: activeFilter === option.key ? theme.status.info : 'transparent',
                  color: activeFilter === option.key ? '#ffffff' : theme.text.muted
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== option.key) {
                    e.currentTarget.style.backgroundColor = theme.sidebar.hover;
                    e.currentTarget.style.color = theme.text.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== option.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.text.muted;
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
