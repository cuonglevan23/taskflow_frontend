// EmailInviteChip Component - Display email invites for non-existent users
// Based on USER_LOOKUP_API_DOCUMENTATION.md

"use client";

import React from 'react';
import { X, Mail } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { DARK_THEME } from '@/constants/theme';

interface EmailInviteChipProps {
  email: string;
  onRemove?: (email: string) => void;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: (email: string) => void;
}

export const EmailInviteChip: React.FC<EmailInviteChipProps> = ({
  email,
  onRemove,
  size = 'md',
  clickable = false,
  onClick
}) => {
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
      onClick(email);
    }
  };

  return (
    <div
      className={`
        inline-flex items-center rounded-full transition-all duration-200
        border-dashed ${sizeClasses[size]}
        ${clickable ? 'cursor-pointer hover:shadow-md' : ''}
        ${onRemove ? 'pr-1' : ''}
      `}
      style={{
        backgroundColor: DARK_THEME.warning?.light || '#fef3c7',
        borderColor: DARK_THEME.warning?.default || '#f59e0b',
        color: DARK_THEME.text.primary
      }}
      onClick={handleClick}
    >
      {/* Email Avatar placeholder */}
      <UserAvatar
        name={email}
        email={email}
        size={avatarSizes[size]}
        fallbackColor="bg-yellow-500"
        showStatus={false}
      />

      {/* Email */}
      <span className="font-medium truncate max-w-32">
        {email}
      </span>

      {/* Invite label */}
      <div className="flex items-center gap-1">
        <Mail className="w-3 h-3" style={{ color: '#92400e' }} />
        <span
          className="text-xs font-medium"
          style={{ color: '#92400e' }}
        >
          Invite
        </span>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(email);
          }}
          className="
            ml-1 p-1 rounded-full transition-colors
            hover:bg-red-100 focus:outline-none focus:bg-red-100
          "
          style={{ color: DARK_THEME.text.secondary }}
          aria-label={`Remove ${email}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default EmailInviteChip;
