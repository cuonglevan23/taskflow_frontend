"use client";

import React from 'react';
import { DARK_THEME } from '@/constants/theme';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth } from '@/components/auth/AuthProvider';
import MessagesHeader from './MessagesHeader';
import MessagesSidebar from './MessagesSidebar';
import MessagesWelcome from './MessagesWelcome';
import MessagesTips from './MessagesTips';
import ConversationList from './ConversationList';
import UserSelectionModal from './UserSelectionModal';
import ChatContent from './ChatContent';
import { ChatConversation, ChatUser } from '@/types/chat';

type FilterType = 'all' | 'unread' | 'teams' | 'direct';

interface MessagesStats {
  conversations: number;
  unread: number;
  teamChats: number;
}

interface MessagesContainerProps {
  showWelcome?: boolean;
  stats?: MessagesStats;
}

export const MessagesContainer = ({
                                    showWelcome = true
                                  }: MessagesContainerProps) => {
  const { user } = useAuth(); // Get current user from auth
  const {
    conversations,
    isConnected,
    openChatWindow,
    unreadCounts,
    loadConversations,
    messages,
    typingUsers,
    sendMessage,
    sendMessageWithAttachments,
    setTyping,
    loadMessages
  } = useChatContext();

  const [activeFilter, setActiveFilter] = React.useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedConversationId, setSelectedConversationId] = React.useState<number | undefined>();
  const [showUserSelection, setShowUserSelection] = React.useState(false);
  const [availableUsers, setAvailableUsers] = React.useState<ChatUser[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);

  // Calculate stats from real data
  const stats = React.useMemo((): MessagesStats => {
    const totalUnread = Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0);
    const teamChats = conversations.filter(conv => conv.type === 'GROUP').length;

    return {
      conversations: conversations.length,
      unread: totalUnread,
      teamChats
    };
  }, [conversations, unreadCounts]);

  // Filter conversations based on active filter and search query
  const filteredConversations = React.useMemo(() => {
    let filtered = [...conversations];

    // Apply filter
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(conv => (unreadCounts.get(conv.id) || 0) > 0);
        break;
      case 'teams':
        filtered = filtered.filter(conv => conv.type === 'GROUP');
        break;
      case 'direct':
        filtered = filtered.filter(conv => conv.type === 'DIRECT');
        break;
        // 'all' shows everything
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
          conv.name.toLowerCase().includes(query) ||
          (conv.participants && conv.participants.some(p => p.name.toLowerCase().includes(query))) ||
          conv.lastMessage?.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [conversations, activeFilter, searchQuery, unreadCounts]);

  // Convert ChatConversation to our UI Conversation format
  const uiConversations = React.useMemo(() => {
    return filteredConversations.map((conv: ChatConversation) => ({
      id: conv.id.toString(),
      type: conv.type === 'DIRECT' ? 'direct' as const : 'team' as const,
      name: conv.name, // Sử dụng trực tiếp name từ API
      title: conv.type === 'DIRECT'
          ? (conv.participants && conv.participants.length > 0
              ? conv.participants.find(p => p.id !== parseInt(localStorage.getItem('userId') || '0'))?.name || conv.name
              : conv.name)
          : conv.name,
      avatarUrl: conv.avatarUrl, // QUAN TRỌNG: Truyền avatarUrl từ conversation gốc
      participants: (conv.participants || []).map(p => ({
        id: p.id.toString(),
        name: p.name,
        avatar: p.avatarUrl || p.avatar,
        avatarUrl: p.avatarUrl, // Đảm bảo avatarUrl được truyền
        isOnline: p.isOnline
      })),
      lastMessage: conv.lastMessage ? {
        text: conv.lastMessage.content,
        timestamp: new Date(conv.lastMessage.createdAt),
        sender: {
          id: conv.lastMessage.senderId?.toString() || 'unknown',
          name: conv.lastMessage.senderName,
          avatar: conv.lastMessage.senderAvatar
        }
      } : undefined,
      unreadCount: unreadCounts.get(conv.id) || 0,
      isActive: selectedConversationId === conv.id
    }));
  }, [filteredConversations, unreadCounts, selectedConversationId]);

  // Handler functions
  const handleNewMessage = React.useCallback(async () => {
    setLoadingUsers(true);
    try {
      // TODO: Replace with actual API call to get available users
      // For now, we'll use mock data - you should replace this with your actual user service
      const mockUsers: ChatUser[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          isOnline: true,
          avatarUrl: "/images/avatar1.jpg"
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          isOnline: false,
          avatarUrl: "/images/avatar2.jpg"
        }
      ];

      setAvailableUsers(mockUsers);
      setShowUserSelection(true);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Handle creating new chat from modal
  const handleCreateChat = React.useCallback((selectedContacts: any[]) => {
    console.log('Creating chat with contacts:', selectedContacts);

    if (selectedContacts.length === 1) {
      // Direct chat with one person
      const contact = selectedContacts[0];
      const chatUser: ChatUser = {
        id: parseInt(contact.id),
        name: contact.name,
        email: `${contact.name.toLowerCase().replace(' ', '.')}@example.com`,
        isOnline: contact.isOnline || false,
        avatarUrl: contact.avatar
      };

      // Open direct chat
      openChatWindow(chatUser);
    } else if (selectedContacts.length > 1) {
      // Team chat with multiple people
      console.log('Creating team chat with multiple contacts:', selectedContacts);
      // TODO: Implement team chat creation logic
      // This would typically involve calling an API to create a group conversation
      // For now, we'll just log it
      alert(`Creating team chat with ${selectedContacts.length} members: ${selectedContacts.map(c => c.name).join(', ')}`);
    }
  }, [openChatWindow]);

  const handleUserSelect = React.useCallback((user: ChatUser) => {
    console.log('Starting conversation with user:', user);
    // Open chat window with selected user
    openChatWindow(user);
  }, [openChatWindow]);

  const handleSearchMessages = React.useCallback(() => {
    console.log('Opening global message search...');
    // TODO: Implement global search functionality
  }, []);

  const handleSearchConversations = React.useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = React.useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

  // Get selected conversation details
  const selectedConversation = React.useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find(conv => conv.id === selectedConversationId);
  }, [selectedConversationId, conversations]);

  // Get messages for selected conversation
  const selectedConversationMessages = React.useMemo(() => {
    if (!selectedConversationId) return [];
    return messages.get(selectedConversationId) || [];
  }, [selectedConversationId, messages]);

  // Get typing users for selected conversation
  const selectedTypingUsers = React.useMemo(() => {
    if (!selectedConversationId) return [];
    return typingUsers.get(selectedConversationId) || [];
  }, [selectedConversationId, typingUsers]);

  const handleConversationSelect = React.useCallback((conversationId: string) => {
    const numId = parseInt(conversationId);
    setSelectedConversationId(numId);

    // Load messages for the selected conversation
    loadMessages(numId);

    // Find the conversation and open chat window if it's direct
    const conversation = conversations.find(c => c.id === numId);
    if (conversation && conversation.type === 'DIRECT') {
      // For direct conversations, find the other participant
      const otherParticipant = conversation.participants && conversation.participants.find(p =>
          p.id !== parseInt(user?.id || '0')
      );
      if (otherParticipant) {
        openChatWindow(otherParticipant);
      }
    }
  }, [conversations, openChatWindow, loadMessages, user?.id]);

  // Handle sending message in chat content
  const handleSendMessage = React.useCallback((content: string, replyToId?: number) => {
    if (selectedConversationId) {
      sendMessage(selectedConversationId, content, replyToId);
    }
  }, [selectedConversationId, sendMessage]);

  // Handle sending message with attachments in chat content
  const handleSendWithAttachments = React.useCallback((content: string, files: File[], images: File[], replyToId?: number) => {
    if (selectedConversationId) {
      console.log('Sending message with attachments:', { content, files: files.length, images: images.length, replyToId });
      sendMessageWithAttachments(selectedConversationId, content, files, images, replyToId);
    }
  }, [selectedConversationId, sendMessageWithAttachments]);

  // Handle typing in chat content
  const handleTyping = React.useCallback((isTyping: boolean) => {
    if (selectedConversationId) {
      setTyping(selectedConversationId, isTyping);
    }
  }, [selectedConversationId, setTyping]);

  const handleStartConversation = React.useCallback(() => {
    handleNewMessage(); // Reuse the same user selection flow
  }, [handleNewMessage]);

  const handleBrowseTeamMembers = React.useCallback(() => {
    console.log('Opening team members browser...');
    // TODO: Implement team members browser - could show a different modal or route
    // For now, we'll use the same user selection flow
    handleNewMessage();
  }, [handleNewMessage]);

  // Load conversations on mount
  React.useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const hasConversations = conversations.length > 0;
  const shouldShowWelcome = showWelcome && !hasConversations;
  const shouldShowChatContent = selectedConversation && !shouldShowWelcome;

  return (
      <div className="h-full flex flex-col">
        {/* Messages Header */}
        <MessagesHeader
        />

        {/* Messages Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar with Conversations */}
          <div className="flex flex-col w-80 border-r" style={{
            backgroundColor: DARK_THEME.background.secondary,
            borderColor: DARK_THEME.border.default
          }}>
            <MessagesSidebar
                onSearchConversations={handleSearchConversations}
                onFilterChange={handleFilterChange}
                activeFilter={activeFilter}
                searchQuery={searchQuery}
                onCreateChat={handleCreateChat}
            />
            <ConversationList
                conversations={uiConversations}
                onConversationSelect={handleConversationSelect}
                selectedConversationId={selectedConversationId?.toString()}
                isLoading={!isConnected}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {shouldShowWelcome ? (
                <>
                  <MessagesWelcome
                      onStartConversation={handleStartConversation}
                      onBrowseTeamMembers={handleBrowseTeamMembers}
                      stats={stats}
                  />
                  <MessagesTips />
                </>
            ) : shouldShowChatContent ? (
                <ChatContent
                    conversation={{
                      id: selectedConversation.id,
                      name: selectedConversation.name,
                      type: selectedConversation.type,
                      participants: selectedConversation.participants || [],
                      avatarUrl: selectedConversation.avatarUrl, // Add missing avatarUrl
                      isOnline: selectedConversation.isOnline   // Add missing isOnline
                    }}
                    messages={selectedConversationMessages}
                    typingUsers={selectedTypingUsers}
                    currentUser={user}
                    isConnected={isConnected}
                    onSendMessage={handleSendMessage}
                    onSendWithAttachments={handleSendWithAttachments}
                    onTyping={handleTyping}
                />
            ) : (
                <div
                    className="flex-1 flex items-center justify-center"
                    style={{ backgroundColor: DARK_THEME.background.primary }}
                >
                  <div style={{ color: DARK_THEME.text.muted }} className="text-center">
                    <div className="mb-4">
                      <svg
                          className="w-16 h-16 mx-auto mb-4"
                          style={{ color: DARK_THEME.text.muted }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: DARK_THEME.text.secondary }}>
                      Select a conversation to start messaging
                    </h3>
                    <p className="text-sm">
                      Choose a conversation from the sidebar or start a new one
                    </p>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* User Selection Modal */}
        <UserSelectionModal
            isOpen={showUserSelection}
            onClose={() => setShowUserSelection(false)}
            onSelectUser={handleUserSelect}
            users={availableUsers}
            isLoading={loadingUsers}
        />
      </div>
  );
};

export default MessagesContainer;
