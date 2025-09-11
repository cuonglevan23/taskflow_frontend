import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatUser } from '@/types/chat';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { DARK_THEME } from '@/constants/theme';

interface ChatIconProps {
  user: ChatUser;
  onClick: () => void;
  isOnline?: boolean;
  unreadCount?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'avatar' | 'minimal';
  className?: string;
}

export function ChatIcon({
  user,
  onClick,
  isOnline = false,
  unreadCount = 0,
  size = 'md',
  variant = 'button',
  className = ''
}: ChatIconProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'avatar') {
    return (
      <div className={`relative cursor-pointer ${className}`} onClick={onClick}>
        <UserAvatar
          name={`${user.firstName} ${user.lastName}`}
          avatar={user.avatarUrl}
          size={size}
          variant="circle"
          className="hover:ring-2 transition-all duration-200"
          style={{
            ':hover': {
              ringColor: DARK_THEME.border.focus
            }
          }}
        />

        {/* Online Status */}
        {isOnline && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full"
            style={{
              border: `2px solid ${DARK_THEME.background.primary}`
            }}
          ></div>
        )}

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs rounded-full flex items-center justify-center font-medium"
            style={{
              backgroundColor: DARK_THEME.status?.error || '#ef4444',
              color: DARK_THEME.text.inverse
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={onClick}
        className={`relative p-1 transition-colors ${className}`}
        style={{
          color: DARK_THEME.text.secondary,
          ':hover': {
            color: DARK_THEME.text.primary
          }
        }}
        title={`Chat with ${user.firstName} ${user.lastName}`}
      >
        <MessageCircle className={iconSizes[size]} />

        {unreadCount > 0 && (
          <div
            className="absolute -top-1 -right-1 min-w-[16px] h-[16px] text-xs rounded-full flex items-center justify-center font-medium"
            style={{
              backgroundColor: DARK_THEME.status?.error || '#ef4444',
              color: DARK_THEME.text.inverse
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
    );
  }

  // Default button variant - Dark Theme
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center justify-center
        ${sizeClasses[size]}
        rounded-full
        transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl
        ${className}
      `}
      style={{
        backgroundColor: DARK_THEME.background.tertiary,
        color: DARK_THEME.text.primary,
        ':hover': {
          backgroundColor: DARK_THEME.background.muted
        }
      }}
      title={`Chat with ${user.firstName} ${user.lastName}`}
    >
      <MessageCircle className={iconSizes[size]} />

      {/* Online Status */}
      {isOnline && (
        <div
          className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-green-500 rounded-full"
          style={{
            border: `2px solid ${DARK_THEME.background.primary}`
          }}
        ></div>
      )}

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs rounded-full flex items-center justify-center font-medium"
          style={{
            backgroundColor: DARK_THEME.status?.error || '#ef4444',
            color: DARK_THEME.text.inverse,
            border: `2px solid ${DARK_THEME.background.primary}`
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
};
