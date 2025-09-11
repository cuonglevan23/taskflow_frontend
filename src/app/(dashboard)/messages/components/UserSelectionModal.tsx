import React from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import { ChatUser } from '@/types/chat';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: ChatUser) => void;
  users: ChatUser[];
  isLoading?: boolean;
}

export const UserSelectionModal = ({
  isOpen,
  onClose,
  onSelectUser,
  users,
  isLoading = false
}: UserSelectionModalProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleUserSelect = (user: ChatUser) => {
    onSelectUser(user);
    onClose();
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-lg shadow-xl max-h-[80vh] flex flex-col"
        style={{
          backgroundColor: DARK_THEME.background.primary,
          borderColor: DARK_THEME.border.default,
          borderWidth: '1px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: DARK_THEME.border.default }}>
          <h2 className="text-lg font-semibold" style={{ color: DARK_THEME.text.primary }}>
            Start New Conversation
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg transition-colors"
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
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b" style={{ borderColor: DARK_THEME.border.default }}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: THEME_COLORS.primary[500] }}
              />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8">
              <p style={{ color: DARK_THEME.text.muted }}>
                {searchQuery ? 'No users found' : 'No users available'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-opacity-50 transition-colors text-left"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {user.avatarUrl || user.avatar ? (
                      <img
                        src={user.avatarUrl || user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: DARK_THEME.background.muted }}
                      >
                        <span className="font-medium" style={{ color: DARK_THEME.text.secondary }}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {user.isOnline && (
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full"
                        style={{
                          backgroundColor: THEME_COLORS.success[500],
                          borderColor: DARK_THEME.background.primary
                        }}
                      />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: DARK_THEME.text.primary }}>
                      {user.name}
                    </div>
                    <div className="text-sm truncate" style={{ color: DARK_THEME.text.muted }}>
                      {user.email}
                    </div>
                    {user.isOnline && (
                      <div className="text-xs" style={{ color: THEME_COLORS.success[500] }}>
                        Online
                      </div>
                    )}
                  </div>

                  {/* Action Icon */}
                  <div style={{ color: DARK_THEME.text.muted }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSelectionModal;
