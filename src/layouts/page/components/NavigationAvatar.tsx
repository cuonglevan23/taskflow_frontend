"use client";

import React, { memo } from 'react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useUser } from '@/contexts/UserContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { RouteConfig } from '../configs/routeNavigationConfig';

interface NavigationAvatarProps {
  config: NonNullable<RouteConfig['avatarConfig']>;
  size?: 'sm' | 'md' | 'lg';
}

const NavigationAvatar = memo(({ config, size = 'md' }: NavigationAvatarProps) => {
  const { theme } = useTheme();
  const { user } = useUser();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Get theme-aware colors
  const getBgColor = (color: string) => {
    if (theme === 'dark') {
      // Darker variants for dark theme
      return color.replace('500', '600').replace('300', '500');
    }
    return color;
  };

  const getTextColor = () => {
    if (config.bgColor === 'gray-300' && theme === 'dark') {
      return 'text-gray-800';
    }
    return 'text-white';
  };

  // Handle user avatar type - use real backend user data
  if (config.type === 'user') {


    return (
      <UserAvatar
        user={user}
        name={user?.name}
        email={user?.email}
        avatar={user?.avatar}
        size={size}
        showTooltip={true}
        fallbackColor={`bg-${getBgColor(config.bgColor)}`}
        className="ring-2 ring-gray-600"
      />
    );
  }

  if (config.type === 'custom' && config.customContent) {
    return <>{config.customContent()}</>;
  }

  if (config.type === 'initial' && config.initial) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-xl shadow-sm bg-${getBgColor(config.bgColor)} ${getTextColor()}`}
      >
        {config.initial}
      </div>
    );
  }

  if (config.type === 'icon' && config.icon) {
    const IconComponent = config.icon;
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-${getBgColor(config.bgColor)} flex items-center justify-center`}>
        <IconComponent className={`${iconSizeClasses[size]} ${getTextColor()}`} />
      </div>
    );
  }

  return null;
});

NavigationAvatar.displayName = 'NavigationAvatar';

export { NavigationAvatar };