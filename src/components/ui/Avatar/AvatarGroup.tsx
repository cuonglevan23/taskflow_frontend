"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import Avatar from "./Avatar";

// Enhanced User interface for avatar data
export interface User {
  id?: string;
  name: string;
  src?: string; // Backward compatibility
  avatar?: string; // New field
  initials?: string; // Fallback initials
  color?: string; // Background color for initials
}

// Enhanced Avatar Group Props
export interface AvatarGroupProps {
  users: User[];
  maxVisible?: number; // Maximum avatars to show before "+X"
  size?: "sm" | "md" | "lg";
  overlap?: boolean; // Whether avatars should overlap
  showTooltip?: boolean; // Show names on hover
  className?: string;
  onUserClick?: (user: User) => void;
}

// Overflow indicator (+X more) with enhanced styling
const OverflowIndicator = ({ 
  count, 
  size = "sm",
  zIndex = 0 
}: { 
  count: number; 
  size?: "sm" | "md" | "lg";
  zIndex?: number;
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full flex items-center justify-center font-medium
        border-2 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg
      `}
      style={{
        backgroundColor: theme.background.secondary || '#f3f4f6',
        borderColor: theme.background.primary || '#ffffff',
        color: theme.text.primary || '#374151',
        zIndex: zIndex,
      }}
      title={`${count} more users`}
    >
      <span className="select-none">+{count}</span>
    </div>
  );
};

// Enhanced Avatar Group Component
const AvatarGroup = ({
  users,
  maxVisible = 3,
  size = "sm",
  overlap = true,
  showTooltip = true,
  className = "",
  onUserClick,
}: AvatarGroupProps) => {
  const { theme } = useTheme();

  // Calculate visible users and overflow
  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = Math.max(0, users.length - maxVisible);

  // Enhanced overlap spacing with size considerations
  const overlapSpacing = {
    sm: overlap ? "-ml-2" : "ml-1",
    md: overlap ? "-ml-3" : "ml-1", 
    lg: overlap ? "-ml-4" : "ml-1",
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Visible Users with enhanced animations */}
      {visibleUsers.map((user, index) => (
        <div
          key={user.id || index}
          className={`
            ${index > 0 ? overlapSpacing[size] : ''} 
            transition-all duration-200 hover:translate-x-1 hover:z-50
          `}
          style={{
            zIndex: visibleUsers.length - index, // Higher z-index for later avatars
          }}
          title={showTooltip ? user.name : undefined}
        >
          <Avatar
            src={user.src || user.avatar}
            name={user.name}
            size={size}
            className={`
              border-2 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg
              ${onUserClick ? 'hover:ring-2 hover:ring-orange-300' : ''}
            `}
            style={{
              borderColor: theme.background.primary || '#ffffff',
              zIndex: visibleUsers.length - index,
            }}
            onClick={() => onUserClick?.(user)}
          />
        </div>
      ))}

      {/* Enhanced Overflow Indicator */}
      {overflowCount > 0 && (
        <div
          className={`
            ${overlapSpacing[size]} 
            transition-all duration-200 hover:translate-x-1
          `}
          style={{ zIndex: 0 }}
        >
          <OverflowIndicator
            count={overflowCount}
            size={size}
            zIndex={0}
          />
        </div>
      )}
    </div>
  );
};

// Backward compatibility wrapper
export default function EnhancedAvatarGroup(props: AvatarGroupProps) {
  return <AvatarGroup {...props} />;
}
