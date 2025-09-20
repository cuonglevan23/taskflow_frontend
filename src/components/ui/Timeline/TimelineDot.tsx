"use client";

import React from 'react';
import { Check, AlertTriangle, X, Info, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DARK_THEME } from '@/constants/theme';
import type { TimelineDotProps } from './types';

// Timeline dot component
export default function TimelineDot<T>({ item, config, renderCustomIcon }: TimelineDotProps<T>) {
  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const dotSize = config.dotSize || 'md';

  // Use item color or status-based colors from DARK_THEME
  const getStatusColor = () => {
    if (item.color) return item.color;

    switch (item.status) {
      case 'success':
        return DARK_THEME.status.success;
      case 'warning':
        return DARK_THEME.status.warning;
      case 'error':
        return DARK_THEME.status.error;
      case 'info':
        return DARK_THEME.status.info;
      default:
        return DARK_THEME.text.muted;
    }
  };

  const statusColor = getStatusColor();

  // Get lucide-react icon based on status
  const getStatusIcon = () => {
    switch (item.status) {
      case 'success':
        return <Check className="w-3 h-3" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />;
      case 'error':
        return <X className="w-3 h-3" />;
      case 'info':
        return <Info className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  if (renderCustomIcon) {
    const customIcon = renderCustomIcon(item);
    if (customIcon) {
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-full border-2',
            iconSizeClasses[dotSize],
            config.animated && 'transition-all duration-200 hover:scale-110'
          )}
          style={{
            backgroundColor: DARK_THEME.background.primary,
            borderColor: statusColor,
            color: statusColor,
          }}
        >
          {/* Ensure customIcon is properly rendered */}
          {React.isValidElement(customIcon) ? customIcon :
           typeof customIcon === 'function' ? React.createElement(customIcon as React.ComponentType<any>, { className: 'w-3 h-3' }) :
           customIcon}
        </div>
      );
    }
  }

  if (item.icon) {
    // More robust handling of icon types
    let iconToRender = null;

    if (typeof item.icon === 'function') {
      // It's a React component (lucide-react icon)
      const IconComponent = item.icon as React.ComponentType<{ className?: string }>;
      iconToRender = <IconComponent className="w-3 h-3" />;
    } else if (React.isValidElement(item.icon)) {
      // It's already a valid React element
      iconToRender = item.icon;
    } else if (typeof item.icon === 'string') {
      // It's a string (emoji or text)
      iconToRender = item.icon;
    } else {
      // Unknown type, try to render as is but with safety
      try {
        iconToRender = item.icon;
      } catch (e) {
        // Fallback to null if it can't be rendered
        iconToRender = null;
      }
    }

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full border-2',
          iconSizeClasses[dotSize],
          config.animated && 'transition-all duration-200 hover:scale-110'
        )}
        style={{
          backgroundColor: DARK_THEME.background.primary,
          borderColor: statusColor,
          color: statusColor,
        }}
      >
        {iconToRender}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border-2',
        dotSizeClasses[dotSize],
        config.animated && 'transition-all duration-200 hover:scale-110'
      )}
      style={{
        backgroundColor: statusColor,
        borderColor: statusColor + '40',
      }}
    >
      {item.status && (
        <div style={{ color: DARK_THEME.background.primary }}>{getStatusIcon()}</div>
      )}
    </div>
  );
}
