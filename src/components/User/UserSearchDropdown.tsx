// UserSearchDropdown Component - Autocomplete search for users
// Based on USER_LOOKUP_API_DOCUMENTATION.md

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, User } from 'lucide-react';
import { useUserSearch } from '@/hooks/lookup';
import { UserLookupDto } from '@/types/user-lookup';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { DARK_THEME } from '@/constants/theme';
import { Z_INDEX } from '@/styles/z-index';

interface UserSearchDropdownProps {
  onSelect: (user: UserLookupDto) => void;
  placeholder?: string;
  limit?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  onSelect,
  placeholder = "Search users...",
  limit = 10,
  disabled = false,
  autoFocus = false,
  className = ""
}) => {
  const { query, setQuery, results, loading, error } = useUserSearch(300);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && results[focusedIndex]) {
          handleUserSelect(results[focusedIndex]);
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
    onSelect(user);
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (query.length >= 2 && results.length > 0) {
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
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
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
                Searching...
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

          {/* No Results */}
          {!loading && !error && results.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center">
              <User className="w-5 h-5 mx-auto mb-2" style={{ color: DARK_THEME.text.secondary }} />
              <span className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                No users found for "{query}"
              </span>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="py-1">
              {results.slice(0, limit).map((user, index) => (
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

                    {/* Online Status Text */}
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
        </div>
      )}
    </div>
  );
};

export default UserSearchDropdown;
