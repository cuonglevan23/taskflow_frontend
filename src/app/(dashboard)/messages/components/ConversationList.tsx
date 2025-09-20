import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

interface User {
  id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;  // Thêm trường avatarUrl từ API
  isOnline?: boolean;
}

interface Conversation {
  id: string;
  type: 'direct' | 'team' | 'DIRECT' | 'GROUP'; // Hỗ trợ cả hai kiểu định dạng
  title?: string;
  name?: string; // Thêm trường name từ API
  avatarUrl?: string;
  participants?: User[];
  memberCount?: number; // Thêm từ API response
  lastMessage?: {
    text?: string;
    content?: string; // Hỗ trợ cả hai tên trường
    timestamp?: Date;
    createdAt?: string; // Hỗ trợ định dạng API
    sender?: User;
    senderName?: string; // Hỗ trợ định dạng API
    senderAvatar?: string; // Hỗ trợ định dạng API
  };
  unreadCount: number;
  isActive?: boolean;
  isOnline?: boolean; // Thêm từ API response
}

interface ConversationListProps {
  conversations: Conversation[];
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
  isLoading?: boolean;
}

const ConversationItem = ({
  conversation,
  isSelected,
  onClick
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    // Add fallback values in case messages.chat.conversations is undefined
    const conversationMessages = messages?.chat?.conversations || {
      now: 'now',
      minutes: 'm',
      hours: 'h',
      days: 'd'
    };

    if (minutes < 1) return conversationMessages.now;
    if (minutes < 60) return `${minutes}${conversationMessages.minutes}`;
    if (hours < 24) return `${hours}${conversationMessages.hours}`;
    if (days < 7) return `${days}${conversationMessages.days}`;
    return date.toLocaleDateString();
  };

  const getConversationAvatar = (): React.ReactNode => {
    // Xử lý nhóm/team conversation
    if (conversation.type === 'team' || conversation.type === 'GROUP') {
      return (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${theme.status.info}20` }}
        >
          <svg className="w-6 h-6" style={{ color: theme.status.info }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      );
    }

    // Ưu tiên sử dụng trực tiếp thông tin từ API cho direct chats
    const name = conversation.name || conversation.title || "Unknown";
    const avatarSrc = conversation.avatarUrl;



    // Sử dụng UserAvatar component thay vì manual img element
    return (
      <UserAvatar
        name={name}
        avatar={avatarSrc}
        size="lg"
        showStatus={true}
        variant="circle"
      />
    );
  };

  return (
    <div
      onClick={onClick}
      className="p-4 cursor-pointer border-b transition-colors"
      style={{
        backgroundColor: isSelected ? `${theme.button.primary.background}15` : 'transparent',
        borderColor: theme.border.default,
        borderLeftWidth: isSelected ? '4px' : '0px',
        borderLeftColor: isSelected ? theme.button.primary.background : 'transparent'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = theme.background.weakHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <div className="flex items-start space-x-3">
        {getConversationAvatar()}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className="text-sm font-medium truncate"
              style={{
                color: conversation.unreadCount > 0 ? theme.text.primary : theme.text.secondary
              }}
            >
              {conversation.title}
            </h3>
            {conversation.lastMessage && conversation.lastMessage.timestamp && (
              <span className="text-xs flex-shrink-0" style={{ color: theme.text.muted }}>
                {formatTimestamp(conversation.lastMessage.timestamp)}
              </span>
            )}
          </div>

          {conversation.lastMessage && (
            <div className="flex items-center justify-between">
              <p
                className="text-sm truncate"
                style={{
                  color: conversation.unreadCount > 0 ? theme.text.primary : theme.text.muted,
                  fontWeight: conversation.unreadCount > 0 ? '500' : '400'
                }}
              >
                {conversation.type === 'team' && conversation.lastMessage.sender && (
                  <span style={{ color: theme.text.muted }}>
                    {conversation.lastMessage.sender.name}:
                  </span>
                )}
                {conversation.lastMessage.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConversationList = ({
  conversations,
  onConversationSelect,
  selectedConversationId,
  isLoading = false
}: ConversationListProps) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Add fallback values for conversation messages
  const conversationMessages = messages?.chat?.conversations || {
    loading: 'Loading conversations...',
    noConversations: 'No conversations found',
    noConversationsHint: 'Try adjusting your filters or start a new conversation'
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
            style={{ borderColor: theme.button.primary.background }}
          ></div>
          <p className="text-sm" style={{ color: theme.text.muted }}>
            {conversationMessages.loading}
          </p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-sm">
          <svg
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: theme.text.muted }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p style={{ color: theme.text.muted }}>{conversationMessages.noConversations}</p>
          <p className="text-xs mt-1" style={{ color: theme.text.muted }}>
            {conversationMessages.noConversationsHint}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedConversationId === conversation.id}
          onClick={() => onConversationSelect(conversation.id)}
        />
      ))}
    </div>
  );
};

export default ConversationList;
