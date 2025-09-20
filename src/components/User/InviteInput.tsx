// InviteInput Component - Advanced input for user selection and email invites
// Based on USER_LOOKUP_API_DOCUMENTATION.md

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Users, Mail } from 'lucide-react';
import { useInviteInput } from '@/hooks/lookup';
import { UserLookupDto } from '@/types/user-lookup';
import { UserChip } from './UserChip';
import { EmailInviteChip } from './EmailInviteChip';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { DARK_THEME } from '@/constants/theme';
import { Z_INDEX } from '@/styles/z-index';

interface InviteInputProps {
  onUserSelect?: (user: UserLookupDto) => void;
  onEmailAdd?: (email: string) => void;
  onSelectionChange?: (users: UserLookupDto[], emails: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  allowEmailInvites?: boolean;
  disabled?: boolean;
  className?: string;
  showSummary?: boolean;
}

export const InviteInput: React.FC<InviteInputProps> = ({
  onUserSelect,
  onEmailAdd,
  onSelectionChange,
  placeholder = "Enter email or search users...",
  maxSelections,
  allowEmailInvites = true,
  disabled = false,
  className = "",
  showSummary = true
}) => {
  const {
    inputValue,
    setInputValue,
    query,
    setQuery,
    suggestions,
    loading,
    selectedUsers,
    emailInvites,
    totalSelected,
    handleUserSelect,
    handleEmailAdd,
    handleInputSubmit,
    removeUser,
    removeEmail,
    clearAll
  } = useInviteInput();

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if max selections reached
  const isMaxReached = maxSelections ? totalSelected >= maxSelections : false;

  // Handle external callbacks
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedUsers, emailInvites);
    }
  }, [selectedUsers, emailInvites, onSelectionChange]);

  const getDisplayName = (user: UserLookupDto): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return user.email;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (suggestions.length > 0) {
          setFocusedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (suggestions.length > 0) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
        }
        break;
      case 'Enter':
      case 'Tab':
      case ',':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          handleSelectUser(suggestions[focusedIndex]);
        } else if (inputValue.trim()) {
          handleSubmitInput();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'Backspace':
        if (!inputValue && (selectedUsers.length > 0 || emailInvites.length > 0)) {
          // Remove last selected item
          if (emailInvites.length > 0) {
            removeEmail(emailInvites[emailInvites.length - 1]);
          } else if (selectedUsers.length > 0) {
            removeUser(selectedUsers[selectedUsers.length - 1].userId);
          }
        }
        break;
    }
  };

  const handleSelectUser = (user: UserLookupDto) => {
    if (isMaxReached) return;

    handleUserSelect(user);
    setInputValue('');
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);

    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const handleSubmitInput = async () => {
    if (!inputValue.trim() || isMaxReached) return;

    await handleInputSubmit(inputValue);
    setInputValue('');
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);

    // Check if it's a valid email for callback
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(inputValue.trim()) && onEmailAdd) {
      onEmailAdd(inputValue.trim());
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
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
    setTimeout(() => {
      setIsOpen(false);
      setFocusedIndex(-1);
    }, 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Create wrapper function for removing user
  const handleRemoveUser = (user: UserLookupDto) => {
    removeUser(user.userId);
  };

  return (
    <div className={`space-y-3 ${className}`} ref={containerRef}>
      {/* Summary */}
      {showSummary && totalSelected > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: DARK_THEME.text.secondary }}>
            <Users className="w-4 h-4" />
            <span>
              {selectedUsers.length} users, {emailInvites.length} email invites
            </span>
          </div>

          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Selected Items */}
      {totalSelected > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg"
             style={{
               backgroundColor: DARK_THEME.background.secondary,
               borderColor: DARK_THEME.border.default
             }}>
          {/* Selected Users */}
          {selectedUsers.map((user) => (
            <UserChip
              key={user.userId}
              user={user}
              onRemove={handleRemoveUser}
              size="sm"
            />
          ))}

          {/* Email Invites */}
          {emailInvites.map((email) => (
            <EmailInviteChip
              key={email}
              email={email}
              onRemove={removeEmail}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Input Section */}
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
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={isMaxReached ? `Maximum ${maxSelections} selections reached` : placeholder}
          disabled={disabled || isMaxReached}
          className={`
            w-full pl-10 pr-4 py-3 border rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${disabled || isMaxReached ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            backgroundColor: DARK_THEME.background.primary,
            borderColor: DARK_THEME.border.default,
            color: DARK_THEME.text.primary,
          }}
        />

        {/* Max selections warning */}
        {isMaxReached && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
              Max reached
            </span>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.length >= 2 && !isMaxReached && (
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
                Searching...
              </span>
            </div>
          )}

          {/* Add Email Option */}
          {!loading && allowEmailInvites && inputValue.includes('@') && (
            <div
              onClick={handleSubmitInput}
              className={`
                px-3 py-2 cursor-pointer transition-colors border-l-4
                ${focusedIndex === -1 ? 'border-l-4' : 'border-l-transparent'}
              `}
              style={{
                backgroundColor: focusedIndex === -1 ? DARK_THEME.background.secondary : 'transparent',
                borderLeftColor: focusedIndex === -1 ? DARK_THEME.border.default: 'transparent'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium" style={{ color: DARK_THEME.text.primary }}>
                    Invite "{inputValue}"
                  </div>
                  <div className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                    Send email invitation
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Results */}
          {!loading && suggestions.length > 0 && (
            <div className="py-1">
              {suggestions.map((user, index) => (
                <div
                  key={user.userId}
                  onClick={() => handleSelectUser(user)}
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
                    {/* User Avatar */}
                    <UserAvatar
                      name={getDisplayName(user)}
                      email={user.email}
                      avatar={user.avatarUrl}
                      size="sm"
                      status={user.isOnline ? 'online' : 'offline'}
                      showStatus={true}
                    />

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" style={{ color: DARK_THEME.text.primary }}>
                        {getDisplayName(user)}
                      </div>
                      <div className="text-sm truncate" style={{ color: DARK_THEME.text.secondary }}>
                        {user.email}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && suggestions.length === 0 && !inputValue.includes('@') && (
            <div className="p-4 text-center">
              <span className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                No users found for "{query}"
              </span>
              {allowEmailInvites && (
                <div className="text-xs mt-1" style={{ color: DARK_THEME.text.secondary }}>
                  Enter an email to send an invitation
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs" style={{ color: DARK_THEME.text.secondary }}>
        Type to search users or enter email addresses. Press Enter, Tab, or comma to add.
        {maxSelections && ` Maximum ${maxSelections} selections.`}
      </div>
    </div>
  );
};

export default InviteInput;
