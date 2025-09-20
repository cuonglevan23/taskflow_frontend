// UserChip Component - Display user with avatar, name, online status
// Based on USER_LOOKUP_API_DOCUMENTATION.md

"use client";

import React from 'react';
import { X } from 'lucide-react';
import { UserLookupDto } from '@/types/user-lookup';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { DARK_THEME } from '@/constants/theme';

interface UserChipProps {
  user: UserLookupDto;
  onRemove?: (user: UserLookupDto) => void;
  showOnlineStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: (user: UserLookupDto) => void;
}

export const UserChip: React.FC<UserChipProps> = ({
  user,
  onRemove,
  showOnlineStatus = true,
  size = 'md',
  clickable = false,
  onClick
}) => {
  const getDisplayName = (): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return user.email;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5'
  };

  const avatarSizes = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(user);
    }
  };

  const displayName = getDisplayName();

  return (
    <div
      className={`
        inline-flex items-center rounded-full transition-all duration-200
        ${sizeClasses[size]}
        ${clickable ? 'cursor-pointer hover:shadow-md' : ''}
        ${onRemove ? 'pr-1' : ''}
      `}
      style={{
        backgroundColor: DARK_THEME.background.secondary,
        border: `1px solid ${DARK_THEME.border.default}`,
        color: DARK_THEME.text.primary
      }}
      onClick={handleClick}
    >
      {/* User Avatar */}
      <UserAvatar
        name={displayName}
        email={user.email}
        avatar={user.avatarUrl}
        size={avatarSizes[size]}
        status={user.isOnline ? 'online' : 'offline'}
        showStatus={showOnlineStatus}
      />

      {/* Display name */}
      <span className="font-medium truncate max-w-32">
        {displayName}
      </span>

      {/* Email (for larger chips) */}
      {size !== 'sm' && user.email !== displayName && (
        <span
          className="text-xs truncate max-w-24 ml-1"
          style={{ color: DARK_THEME.text.secondary }}
        >
          {user.email}
        </span>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(user);
          }}
          className="
            ml-1 p-1 rounded-full transition-colors
            hover:bg-red-100 focus:outline-none focus:bg-red-100
          "
          style={{ color: DARK_THEME.text.secondary }}
          aria-label={`Remove ${displayName}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default UserChip;
