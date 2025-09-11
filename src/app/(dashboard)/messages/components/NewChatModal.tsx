"use client";

import React from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import BaseModal from '@/components/ui/modal/BaseModal';
import { useChatContext } from '@/contexts/ChatContext';
import { FriendForGroupChat } from '@/types/chat';

interface Contact {
  id: number; // Changed to number to match API
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (selectedContacts: Contact[]) => void;
}

export const NewChatModal = ({ isOpen, onClose, onStartChat }: NewChatModalProps) => {
  const {
    friends,
    loadingFriends,
    friendsError,
    createDirectChat,
    createGroupFromFriends,
    refetchFriends
  } = useChatContext();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedContacts, setSelectedContacts] = React.useState<Contact[]>([]);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Convert friends to contacts format
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

  // Load friends when modal opens
  React.useEffect(() => {
    if (isOpen && friends.length === 0 && !loadingFriends) {
      refetchFriends();
    }
  }, [isOpen, friends.length, loadingFriends, refetchFriends]);

  const handleContactToggle = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleStartChat = async () => {
    if (selectedContacts.length === 0) return;

    setCreating(true);
    setError(null);

    try {
      if (selectedContacts.length === 1) {
        // Create direct conversation
        const contact = selectedContacts[0];
        await createDirectChat(contact.id);
        console.log('Direct chat created with:', contact.name);
      } else {
        // Create group conversation
        const groupName = `Group with ${selectedContacts.map(c => c.name.split(' ')[0]).join(', ')}`;
        const friendIds = selectedContacts.map(c => c.id);
        await createGroupFromFriends(groupName, friendIds, `Group chat with ${selectedContacts.length} members`);
        console.log('Group chat created with:', selectedContacts.length, 'members');
      }

      // Call parent callback if provided
      if (onStartChat) {
        onStartChat(selectedContacts);
      }

      // Reset state and close modal
      handleCancel();
    } catch (err) {
      console.error('Failed to create chat:', err);
      setError('Failed to create chat. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    setSelectedContacts([]);
    setSearchQuery('');
    setError(null);
    onClose();
  };

  const getAvatarColor = (id: number) => {
    const colors = ['#7c2d12', '#eab308', '#0ea5e9', '#8b5cf6', '#ef4444', '#10b981'];
    return colors[id % colors.length];
  };

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Footer with buttons
  const footer = (
    <div className="p-6 flex space-x-3">
      <button
        onClick={handleCancel}
        disabled={creating}
        className="flex-1 py-3 px-4 rounded-lg font-medium transition-colors border-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: THEME_COLORS.primary[500],
          color: THEME_COLORS.primary[500],
          backgroundColor: 'transparent'
        }}
      >
        Cancel
      </button>
      <button
        onClick={handleStartChat}
        disabled={selectedContacts.length === 0 || creating || loadingFriends}
        className="flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: selectedContacts.length > 0 && !creating && !loadingFriends
            ? THEME_COLORS.primary[500]
            : DARK_THEME.text.muted
        }}
      >
        {creating ? 'Creating...' : 'Start Chat'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="New Chat"
      maxWidth="md"
      footer={footer}
      backdropClickToClose={!creating}
      contentClassName="p-0"
      footerClassName="p-0"
    >
      {/* Error Message */}
      {(error || friendsError) && (
        <div className="p-4 mx-6 mt-6 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          <p className="text-sm">{error || friendsError}</p>
          {friendsError && (
            <button
              onClick={refetchFriends}
              className="mt-2 text-sm underline hover:no-underline"
              disabled={loadingFriends}
            >
              {loadingFriends ? 'Retrying...' : 'Retry'}
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="p-6 border-b" style={{ borderColor: DARK_THEME.border.default }}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loadingFriends || creating}
            className="w-full pl-4 pr-10 py-3 text-base rounded-lg border focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50"
            style={{
              backgroundColor: DARK_THEME.search.background,
              color: DARK_THEME.search.text,
              borderColor: DARK_THEME.border.default
            }}
            onFocus={(e) => {
              if (!loadingFriends && !creating) {
                e.currentTarget.style.backgroundColor = DARK_THEME.search.backgroundActive;
                e.currentTarget.style.borderColor = THEME_COLORS.primary[500];
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = DARK_THEME.search.background;
              e.currentTarget.style.borderColor = DARK_THEME.border.default;
            }}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5" style={{ color: DARK_THEME.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: DARK_THEME.text.primary }}>
          Contacts {selectedContacts.length > 0 && `(${selectedContacts.length} selected)`}
        </h3>

        {loadingFriends ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: THEME_COLORS.primary[500] }}></div>
            <span className="ml-3" style={{ color: DARK_THEME.text.muted }}>Loading contacts...</span>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8" style={{ color: DARK_THEME.text.muted }}>
                {searchQuery ? 'No contacts found matching your search.' : 'No contacts available.'}
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContacts.some(c => c.id === contact.id);

                return (
                  <div
                    key={contact.id}
                    onClick={() => !creating && handleContactToggle(contact)}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      creating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => {
                      if (!creating) {
                        e.currentTarget.style.backgroundColor = DARK_THEME.sidebar.hover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: getAvatarColor(contact.id) }}
                        >
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={contact.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            getAvatarInitials(contact.name)
                          )}
                        </div>
                        {contact.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: DARK_THEME.text.primary }}>
                          {contact.name}
                        </div>
                        <div className="text-sm" style={{ color: DARK_THEME.text.muted }}>
                          {contact.email}
                        </div>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      className="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors"
                      style={{
                        borderColor: isSelected ? THEME_COLORS.primary[500] : DARK_THEME.border.default,
                        backgroundColor: isSelected ? THEME_COLORS.primary[500] : 'transparent'
                      }}
                    >
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default NewChatModal;
