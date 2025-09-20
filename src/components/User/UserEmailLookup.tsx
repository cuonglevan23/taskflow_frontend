// UserEmailLookup Component - Email input with user dropdown lookup
// Tích hợp UserSearchDropdown và EmailInviteChip

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, User, Mail, X } from 'lucide-react';
import { useUserSearch } from '@/hooks/lookup';
import { UserLookupDto } from '@/types/user-lookup';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { DARK_THEME } from '@/constants/theme';
import { Z_INDEX } from '@/styles/z-index';

interface UserEmailLookupProps {
  onUserSelect?: (user: UserLookupDto) => void;
  onEmailInvite?: (email: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties; // ✅ ADD: style prop
  showSelectedUsers?: boolean;
  selectedUsers?: UserLookupDto[];
  selectedEmails?: string[];
  onRemoveUser?: (user: UserLookupDto) => void;
  onRemoveEmail?: (email: string) => void;
}

export const UserEmailLookup: React.FC<UserEmailLookupProps> = ({
  onUserSelect,
  onEmailInvite,
  placeholder = "Enter email or search users...",
  disabled = false,
  autoFocus = false,
  className = "",
  style,
  showSelectedUsers = true,
  selectedUsers = [],
  selectedEmails = [],
  onRemoveUser,
  onRemoveEmail
}) => {
  const { query, setQuery, results, loading, error } = useUserSearch(300);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if current query is a valid email
  const isQueryValidEmail = isValidEmail(query);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && results.length === 0 && !isQueryValidEmail) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const maxIndex = isQueryValidEmail ? results.length : results.length - 1;
        setFocusedIndex(prev => prev < maxIndex ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const minIndex = isQueryValidEmail ? results.length : results.length - 1;
        setFocusedIndex(prev => prev > 0 ? prev - 1 : minIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (isQueryValidEmail && focusedIndex === results.length) {
          // Select email invite option
          handleEmailInvite();
        } else if (focusedIndex >= 0 && results[focusedIndex]) {
          // Select user
          handleUserSelect(results[focusedIndex]);
        } else if (isQueryValidEmail && results.length === 0) {
          // If no users found but valid email, invite email
          handleEmailInvite();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleUserSelect = (user: UserLookupDto) => {
    onUserSelect?.(user);
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const handleEmailInvite = () => {
    if (isQueryValidEmail) {
      onEmailInvite?.(query);
      setQuery('');
      setIsOpen(false);
      setFocusedIndex(-1);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => {
      setIsOpen(false);
      setFocusedIndex(-1);
    }, 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const getDisplayName = (user: UserLookupDto): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return user.email;
  };

  return (
    <div className={`space-y-3 ${className}`} style={style}>
      {/* Selected Users and Emails Display */}
      {showSelectedUsers && (selectedUsers.length > 0 || selectedEmails.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {/* Selected Users */}
          {selectedUsers.map((user) => (
            <div
              key={user.userId}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200"
              style={{
                backgroundColor: DARK_THEME.background.secondary,
                border: `1px solid ${DARK_THEME.border.default}`,
                color: DARK_THEME.text.primary
              }}
            >
              <UserAvatar
                name={getDisplayName(user)}
                email={user.email}
                avatar={user.avatarUrl}
                size="xs"
                status={user.isOnline ? 'online' : 'offline'}
                showStatus={true}
              />
              <span className="font-medium truncate max-w-32">
                {getDisplayName(user)}
              </span>
              {onRemoveUser && (
                <button
                  onClick={() => onRemoveUser(user)}
                  className="ml-1 p-1 rounded-full transition-colors hover:bg-red-100 focus:outline-none focus:bg-red-100"
                  style={{ color: DARK_THEME.text.secondary }}
                  aria-label={`Remove ${getDisplayName(user)}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Selected Emails */}
          {selectedEmails.map((email) => (
            <div
              key={email}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border-dashed transition-all duration-200"
              style={{
                backgroundColor: DARK_THEME.warning?.light || '#451a03',
                borderColor: DARK_THEME.warning?.default || '#f59e0b',
                color: DARK_THEME.text.primary
              }}
            >
              <UserAvatar
                name={email}
                email={email}
                size="xs"
                fallbackColor="bg-yellow-500"
                showStatus={false}
              />
              <span className="font-medium truncate max-w-32">{email}</span>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" style={{ color: '#92400e' }} />
                <span className="text-xs font-medium" style={{ color: '#92400e' }}>
                  Invite
                </span>
              </div>
              {onRemoveEmail && (
                <button
                  onClick={() => onRemoveEmail(email)}
                  className="ml-1 p-1 rounded-full transition-colors hover:bg-red-100 focus:outline-none focus:bg-red-100"
                  style={{ color: DARK_THEME.text.secondary }}
                  aria-label={`Remove ${email}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: DARK_THEME.text.secondary }} />
            ) : (
              <Search className="w-4 h-4" style={{ color: DARK_THEME.text.secondary }} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-10 pr-4 py-2 border rounded-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{
              backgroundColor: DARK_THEME.background.secondary,
              borderColor: DARK_THEME.border.default,
              color: DARK_THEME.text.primary,
            }}
          />
        </div>

        {/* Dropdown Results */}
        {isOpen && query.length >= 2 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg max-h-64 overflow-y-auto"
            style={{
              backgroundColor: DARK_THEME.background.primary,
              borderColor: DARK_THEME.border.default,
              zIndex: Z_INDEX.dropdown
            }}
          >
            {/* Loading State */}
            {loading && (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" style={{ color: DARK_THEME.text.secondary }} />
                <span className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                  Searching users...
                </span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="p-4 text-center">
                <span className="text-sm text-red-500">
                  {error}
                </span>
              </div>
            )}

            {/* User Results */}
            {!loading && results.length > 0 && (
              <div className="py-1">
                {results.map((user, index) => (
                  <div
                    key={user.userId}
                    onClick={() => handleUserSelect(user)}
                    className={`
                      px-3 py-2 cursor-pointer transition-colors border-l-4
                      ${index === focusedIndex ? 'border-l-4' : 'border-l-transparent'}
                    `}
                    style={{
                      backgroundColor: index === focusedIndex
                        ? DARK_THEME.background.secondary
                        : 'transparent',
                      borderLeftColor: index === focusedIndex
                        ? DARK_THEME.border.default
                        : 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={getDisplayName(user)}
                        email={user.email}
                        avatar={user.avatarUrl}
                        size="sm"
                        status={user.isOnline ? 'online' : 'offline'}
                        showStatus={true}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate" style={{ color: DARK_THEME.text.primary }}>
                            {getDisplayName(user)}
                          </span>
                          {user.username && (
                            <span className="text-xs px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: DARK_THEME.background.secondary,
                                    color: DARK_THEME.text.secondary
                                  }}>
                              @{user.username}
                            </span>
                          )}
                        </div>
                        <div className="text-sm truncate" style={{ color: DARK_THEME.text.secondary }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Email Invite Option */}
            {isQueryValidEmail && (
              <div>
                {results.length > 0 && <div className="border-t" style={{ borderColor: DARK_THEME.border.default }} />}
                <div
                  onClick={handleEmailInvite}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors border-l-4
                    ${focusedIndex === results.length ? 'border-l-4' : 'border-l-transparent'}
                  `}
                  style={{
                    backgroundColor: focusedIndex === results.length
                      ? DARK_THEME.warning?.light || '#451a03'
                      : 'transparent',
                    borderLeftColor: focusedIndex === results.length
                      ? DARK_THEME.warning?.default || '#f59e0b'
                      : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: DARK_THEME.warning?.default || '#f59e0b' }}>
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: DARK_THEME.text.primary }}>
                        Invite "{query}"
                      </div>
                      <div className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                        Send an invitation to this email address
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && results.length === 0 && !isQueryValidEmail && (
              <div className="p-4 text-center">
                <User className="w-5 h-5 mx-auto mb-2" style={{ color: DARK_THEME.text.secondary }} />
                <span className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                  No users found for "{query}"
                </span>
                <div className="text-xs mt-1" style={{ color: DARK_THEME.text.secondary }}>
                  Enter a valid email address to send an invitation
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEmailLookup;
