import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { ChatUser, FriendForGroupChat, ChatConversation } from '@/types/chat';
import { useGroupChat } from '@/hooks/chat/useGroupChat';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: ChatUser) => void;
  onCreateGroup?: (conversation: ChatConversation) => void;
  users: ChatUser[];
  isLoading?: boolean;
}

export const UserSelectionModal = ({
  isOpen,
  onClose,
  onSelectUser,
  onCreateGroup,
  users,
  isLoading = false
}: UserSelectionModalProps) => {
  // Theme and Language Context
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = React.useState('');
  const [groupDescription, setGroupDescription] = React.useState('');
  const [groupStep, setGroupStep] = React.useState<'setup' | 'select-friends'>('setup');

  // Group chat hook
  const {
    friends,
    loadingFriends,
    loadFriendsForGroupChat,
    toggleFriendSelection,
    clearFriendSelections,
    getSelectedFriends,
    creatingGroup,
    createGroupChat
  } = useGroupChat({
    onConversationCreated: (conversation) => {
      onCreateGroup?.(conversation);
      handleClose();
    }
  });

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const filteredFriends = React.useMemo(() => {
    if (!searchQuery.trim()) return friends;

    const query = searchQuery.toLowerCase();
    return friends.filter(friend =>
      friend.name.toLowerCase().includes(query) ||
      friend.email.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  const selectedFriends = getSelectedFriends();
  const canProceedToFriends = groupName.trim().length > 0;
  const canCreateGroup = selectedFriends.length > 0;

  React.useEffect(() => {
    if (isOpen && currentTab === 'group' && groupStep === 'select-friends' && friends.length === 0) {
      loadFriendsForGroupChat().catch(console.error);
    }
  }, [isOpen, currentTab, groupStep, friends.length, loadFriendsForGroupChat]);

  const handleUserSelect = (user: ChatUser) => {
    onSelectUser(user);
    onClose();
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
    setCurrentTab('direct');
    setGroupName('');
    setGroupDescription('');
    setGroupStep('setup');
    clearFriendSelections();
  };

  const handleProceedToFriends = () => {
    if (canProceedToFriends) {
      setGroupStep('select-friends');
      if (friends.length === 0) {
        loadFriendsForGroupChat().catch(console.error);
      }
    }
  };

  const handleBackToSetup = () => {
    setGroupStep('setup');
  };

  const handleCreateGroupChat = async () => {
    if (!canCreateGroup) return;

    try {
      const selectedFriendIds = selectedFriends.map(friend => friend.id);
      await createGroupChat(
        groupName.trim(),
        selectedFriendIds,
        groupDescription.trim() || undefined
      );
    } catch (error) {
      console.error('Failed to create group chat:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return messages?.chat?.status?.offline || 'Never';

    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return messages?.chat?.status?.lastSeenRecently || 'Recently';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-xl shadow-2xl max-h-[80vh] overflow-hidden"
        style={{
          backgroundColor: theme.background.primary,
          border: `1px solid ${theme.border.default}`
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme.border.default }}
        >
          <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
            {currentTab === 'direct'
              ? (messages?.chat?.contacts?.title || 'Select Contact')
              : groupStep === 'setup'
                ? (messages?.chat?.createGroup || 'Create Group')
                : (messages?.chat?.contacts?.selectContacts || 'Select Friends')
            }
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              color: theme.text.muted,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.muted;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: theme.border.default }}>
          <button
            onClick={() => setCurrentTab('direct')}
            className="flex-1 py-3 px-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentTab === 'direct' ? theme.background.secondary : 'transparent',
              color: currentTab === 'direct' ? theme.text.primary : theme.text.muted,
              borderBottom: currentTab === 'direct' ? `2px solid ${theme.status.info}` : 'none'
            }}
          >
            {messages?.chat?.directMessage || 'Direct Message'}
          </button>
          <button
            onClick={() => setCurrentTab('group')}
            className="flex-1 py-3 px-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentTab === 'group' ? theme.background.secondary : 'transparent',
              color: currentTab === 'group' ? theme.text.primary : theme.text.muted,
              borderBottom: currentTab === 'group' ? `2px solid ${theme.status.info}` : 'none'
            }}
          >
            {messages?.chat?.groupChat || 'Group Chat'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentTab === 'direct' ? (
            // Direct Message Tab
            <div className="flex flex-col h-full">
              {/* Search */}
              <div className="p-4 border-b" style={{ borderColor: theme.border.default }}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={messages?.chat?.contacts?.searchContacts || 'Search contacts...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border transition-colors"
                    style={{
                      backgroundColor: theme.search.background,
                      color: theme.search.text,
                      borderColor: theme.border.default
                    }}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" style={{ color: theme.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.status.info }}></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm" style={{ color: theme.text.muted }}>
                      {messages?.chat?.contacts?.noContacts || 'No contacts found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.background.weakHover || theme.background.muted;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div className="flex-shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                              style={{
                                backgroundColor: theme.status.info,
                                color: 'white'
                              }}
                            >
                              {getInitials(user.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                            {user.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: theme.text.muted }}>
                            {user.isOnline
                              ? (messages?.chat?.status?.online || 'Online')
                              : formatLastSeen(user.lastSeen)
                            }
                          </p>
                        </div>
                        {user.isOnline && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: theme.status.success }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Group Chat Tab
            <div className="flex flex-col h-full">
              {groupStep === 'setup' ? (
                // Group Setup Step
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      {messages?.chat?.groupName || 'Group Name'} *
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder={messages?.chat?.groupName || 'Enter group name'}
                      className="w-full px-3 py-2 text-sm rounded-lg border transition-colors"
                      style={{
                        backgroundColor: theme.background.secondary,
                        color: theme.text.primary,
                        borderColor: theme.border.default
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      {messages?.chat?.groupDescription || 'Description'} (Optional)
                    </label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder={messages?.chat?.groupDescription || 'Enter group description'}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border transition-colors resize-none"
                      style={{
                        backgroundColor: theme.background.secondary,
                        color: theme.text.primary,
                        borderColor: theme.border.default
                      }}
                    />
                  </div>
                  <button
                    onClick={handleProceedToFriends}
                    disabled={!canProceedToFriends}
                    className="w-full py-2 px-4 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: canProceedToFriends ? theme.status.info : theme.background.muted,
                      color: canProceedToFriends ? 'white' : theme.text.muted
                    }}
                  >
                    {messages?.common?.next || 'Next'}
                  </button>
                </div>
              ) : (
                // Friend Selection Step
                <div className="flex flex-col h-full">
                  {/* Header with back button */}
                  <div className="flex items-center p-4 border-b" style={{ borderColor: theme.border.default }}>
                    <button
                      onClick={handleBackToSetup}
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors"
                      style={{
                        color: theme.text.muted,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.background.muted;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        {groupName}
                      </h3>
                      <p className="text-xs" style={{ color: theme.text.muted }}>
                        {selectedFriends.length} {messages?.chat?.contacts?.selectedContacts || 'selected'}
                      </p>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="p-4 border-b" style={{ borderColor: theme.border.default }}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={messages?.chat?.contacts?.searchContacts || 'Search friends...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border transition-colors"
                        style={{
                          backgroundColor: theme.search.background,
                          color: theme.search.text,
                          borderColor: theme.border.default
                        }}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4" style={{ color: theme.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Friends List */}
                  <div className="flex-1 overflow-y-auto p-2">
                    {loadingFriends ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.status.info }}></div>
                      </div>
                    ) : filteredFriends.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm" style={{ color: theme.text.muted }}>
                          {messages?.chat?.contacts?.noContacts || 'No friends found'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredFriends.map((friend) => (
                          <div
                            key={friend.id}
                            onClick={() => toggleFriendSelection(friend)}
                            className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors"
                            style={{
                              backgroundColor: friend.selected ? theme.background.secondary : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              if (!friend.selected) {
                                e.currentTarget.style.backgroundColor = theme.background.weakHover || theme.background.muted;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!friend.selected) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <div className="flex-shrink-0">
                              {friend.avatarUrl ? (
                                <img
                                  src={friend.avatarUrl}
                                  alt={friend.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                                  style={{
                                    backgroundColor: theme.status.info,
                                    color: 'white'
                                  }}
                                >
                                  {getInitials(friend.name)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                                {friend.name}
                              </p>
                              <p className="text-xs truncate" style={{ color: theme.text.muted }}>
                                {friend.isOnline
                                  ? (messages?.chat?.status?.online || 'Online')
                                  : formatLastSeen(friend.lastSeen)
                                }
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                friend.selected ? 'border-transparent' : ''
                              }`}
                              style={{
                                backgroundColor: friend.selected ? theme.status.info : 'transparent',
                                borderColor: friend.selected ? theme.status.info : theme.border.default
                              }}
                            >
                              {friend.selected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Create Group Button */}
                  <div className="p-4 border-t" style={{ borderColor: theme.border.default }}>
                    <button
                      onClick={handleCreateGroupChat}
                      disabled={!canCreateGroup || creatingGroup}
                      className="w-full py-2 px-4 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: canCreateGroup && !creatingGroup ? theme.status.info : theme.background.muted,
                        color: canCreateGroup && !creatingGroup ? 'white' : theme.text.muted
                      }}
                    >
                      {creatingGroup
                        ? (messages?.common?.loading || 'Creating...')
                        : (messages?.chat?.createGroup || 'Create Group')
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSelectionModal;
