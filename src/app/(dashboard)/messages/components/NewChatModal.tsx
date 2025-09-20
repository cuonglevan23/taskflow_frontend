"use client";

import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import BaseModal from '@/components/ui/modal/BaseModal';
import { useGroupChat } from '@/hooks/chat/useGroupChat';
import { User, Users, Search, Check, X } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (selectedContacts: Contact[]) => void;
}

export const NewChatModal = ({ isOpen, onClose, onStartChat }: NewChatModalProps) => {
  // Theme and Language Context
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // 🔥 NEW: Use the new useGroupChat hook
  const {
    friends,
    loadingFriends,
    creatingGroup,
    loadFriendsForGroupChat,
    toggleFriendSelection,
    clearFriendSelections,
    getSelectedFriends,
    createGroupChat,
    createGroupChatWithUserIds
  } = useGroupChat({
    onConversationCreated: (conversation) => {
      console.log('✅ Group chat created:', conversation);
      handleClose();
    }
  });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [chatType, setChatType] = React.useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Convert friends to contacts format for compatibility
  const contacts: Contact[] = React.useMemo(() => {
    return friends.map(friend => ({
      id: friend.id,
      name: friend.name,
      email: friend.email,
      avatarUrl: friend.avatarUrl,
      isOnline: friend.isOnline
    }));
  }, [friends]);

  // Filter contacts based on search query
  const filteredContacts = React.useMemo(() => {
    if (!searchQuery) return contacts;
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, contacts]);

  // Get selected contacts from useGroupChat hook
  const selectedContacts = React.useMemo(() => {
    return getSelectedFriends().map(friend => ({
      id: friend.id,
      name: friend.name,
      email: friend.email,
      avatarUrl: friend.avatarUrl,
      isOnline: friend.isOnline
    }));
  }, [getSelectedFriends]);

  // Load friends when modal opens
  React.useEffect(() => {
    if (isOpen && friends.length === 0 && !loadingFriends) {
      loadFriendsForGroupChat();
    }
  }, [isOpen, friends.length, loadingFriends, loadFriendsForGroupChat]);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setChatType('direct');
      setGroupName('');
      setError(null);
      clearFriendSelections();
    }
  }, [isOpen, clearFriendSelections]);

  const handleContactToggle = (contact: Contact) => {
    toggleFriendSelection(contact.id);
    setError(null);
  };

  const handleClose = () => {
    clearFriendSelections();
    setSearchQuery('');
    setGroupName('');
    setError(null);
    onClose();
  };

  const handleStartChat = async () => {
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }

    setError(null);

    try {
      if (chatType === 'direct') {
        if (selectedContacts.length !== 1) {
          setError('Please select exactly one contact for direct chat');
          return;
        }

        // For direct chat, we'll use createGroupChatWithUserIds with single user
        const contact = selectedContacts[0];
        await createGroupChatWithUserIds(
          `Direct chat with ${contact.name}`,
          [contact.id]
        );
      } else {
        // Group chat
        if (selectedContacts.length < 2) {
          setError('Please select at least 2 contacts for group chat');
          return;
        }

        if (!groupName.trim()) {
          setError('Please enter a group name');
          return;
        }

        const friendIds = selectedContacts.map(c => c.id);
        await createGroupChat(
          groupName.trim(),
          friendIds,
          `Group chat with ${selectedContacts.length} members`
        );
      }

      // Call parent callback if provided
      if (onStartChat) {
        onStartChat(selectedContacts);
      }

      console.log('Chat created successfully');
    } catch (error) {
      console.error('Failed to create chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to create chat');
    }
  };

  const renderContactItem = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);

    return (
      <div
        key={contact.id}
        onClick={() => handleContactToggle(contact)}
        className="flex items-center justify-between p-3 cursor-pointer transition-colors rounded-lg"
        style={{
          backgroundColor: isSelected ? theme.background.secondary : 'transparent',
          borderColor: isSelected ? theme.border.focus : 'transparent',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = theme.background.weakHover || theme.background.muted;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.status.info }}
              >
                <User className="w-5 h-5" style={{ color: 'white' }} />
              </div>
            )}

            {/* Online status indicator */}
            {contact.isOnline && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                style={{
                  backgroundColor: theme.status.success,
                  borderColor: theme.background.primary
                }}
              />
            )}
          </div>

          {/* Contact info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p
                className="text-sm font-medium truncate"
                style={{ color: theme.text.primary }}
              >
                {contact.name}
              </p>
              {contact.isOnline && (
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: theme.status.success + '20',
                    color: theme.status.success
                  }}
                >
                  {messages?.chat?.status?.online || 'Online'}
                </span>
              )}
            </div>
            <p
              className="text-xs truncate"
              style={{ color: theme.text.muted }}
            >
              {contact.email}
            </p>
          </div>
        </div>

        {/* Selection indicator */}
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${
            isSelected ? 'bg-primary' : 'border-2'
          }`}
          style={{
            backgroundColor: isSelected ? theme.status.info : 'transparent',
            borderColor: isSelected ? theme.status.info : theme.border.default
          }}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Start New Chat"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Chat Type Selection */}
        <div className="flex space-x-4">
          <button
            onClick={() => setChatType('direct')}
            className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
              chatType === 'direct' ? 'border-2' : 'border'
            }`}
            style={{
              backgroundColor: chatType === 'direct' ? theme.background.muted : theme.background.secondary,
              borderColor: chatType === 'direct' ? theme.status.info : theme.border.default,
              color: chatType === 'direct' ? theme.status.info : theme.text.secondary
            }}
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Direct Chat</span>
          </button>

          <button
            onClick={() => setChatType('group')}
            className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
              chatType === 'group' ? 'border-2' : 'border'
            }`}
            style={{
              backgroundColor: chatType === 'group' ? theme.background.muted : theme.background.secondary,
              borderColor: chatType === 'group' ? theme.status.info : theme.border.default,
              color: chatType === 'group' ? theme.status.info : theme.text.secondary
            }}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Group Chat</span>
          </button>
        </div>

        {/* Group Name Input (only for group chat) */}
        {chatType === 'group' && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:border-transparent transition-colors"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.status.info;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.border.default;
              }}
            />
          </div>
        )}

        {/* Search Contacts */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text.primary }}
          >
            Select Contacts {chatType === 'direct' ? '(1 person)' : '(2+ people)'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:border-transparent transition-colors"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.status.info;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.border.default;
              }}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: theme.text.muted }}
            />
          </div>
        </div>

        {/* Selected Contacts Summary */}
        {selectedContacts.length > 0 && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: theme.background.muted }}>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: theme.status.info }}
            >
              Selected ({selectedContacts.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedContacts.map((contact) => (
                <span
                  key={contact.id}
                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: theme.background.secondary,
                    color: theme.text.primary
                  }}
                >
                  <span>{contact.name}</span>
                  <button
                    onClick={() => handleContactToggle(contact)}
                    className="hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div>
          <div
            className="max-h-64 overflow-y-auto border rounded-lg"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default
            }}
          >
            {loadingFriends ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: theme.status.info }}></div>
                <span className="ml-2 text-sm" style={{ color: theme.text.muted }}>
                  Loading contacts...
                </span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 mx-auto mb-2" style={{ color: theme.text.muted }} />
                <p className="text-sm" style={{ color: theme.text.muted }}>
                  {searchQuery ? 'No contacts found matching your search' : 'No contacts available'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredContacts.map(renderContactItem)}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: theme.status.error + '20',
              borderColor: theme.status.error,
              color: theme.status.error
            }}
          >
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: theme.background.secondary,
              color: theme.text.secondary,
              border: `1px solid ${theme.border.default}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.muted;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleStartChat}
            disabled={selectedContacts.length === 0 || creatingGroup || (chatType === 'group' && !groupName.trim())}
            className="px-6 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.status.info,
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = theme.status.info;
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = theme.status.info;
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {creatingGroup ? 'Creating...' : `Start ${chatType === 'direct' ? 'Direct' : 'Group'} Chat`}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default NewChatModal;
