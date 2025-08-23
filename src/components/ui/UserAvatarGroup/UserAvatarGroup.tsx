"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { UserAvatar, type UserAvatarProps } from "../UserAvatar";
import type { User } from "@/types/auth";

export interface UserAvatarGroupProps {
  users: User[];
  max?: number;
  size?: UserAvatarProps["size"];
  variant?: UserAvatarProps["variant"];
  className?: string;
  showTooltip?: boolean;
  onUserClick?: (user: User) => void;
  onMoreClick?: () => void;
  spacing?: "tight" | "normal" | "loose";
}

const UserAvatarGroup = forwardRef<HTMLDivElement, UserAvatarGroupProps>(
  (
    {
      users,
      max = 5,
      size = "md",
      variant = "circle",
      className,
      showTooltip = true,
      onUserClick,
      onMoreClick,
      spacing = "normal",
      ...props
    },
    ref
  ) => {
    // Add null checking to prevent crash when users is undefined
    const safeUsers = users || [];
    const visibleUsers = safeUsers.slice(0, max);
    const remainingCount = Math.max(0, safeUsers.length - max);

    const spacingClasses = {
      tight: "-space-x-1",
      normal: "-space-x-2",
      loose: "-space-x-1",
    };

    const sizeClasses = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
      xl: "h-16 w-16 text-xl",
      "2xl": "h-20 w-20 text-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className="relative hover:z-10 transition-all duration-200"
            style={{ zIndex: visibleUsers.length - index }}
          >
            <div className="ring-2 ring-gray-900 rounded-full transition-all duration-200 hover:ring-gray-700">
              <UserAvatar
                user={user}
                size={size}
                variant={variant}
                showTooltip={showTooltip}
                onClick={() => onUserClick?.(user)}
                className="transition-all duration-200 hover:scale-110 shadow-md hover:shadow-xl"
              />
            </div>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="relative hover:z-10 transition-all duration-200" style={{ zIndex: 0 }}>
            <div className="ring-2 ring-gray-900 rounded-full transition-all duration-200 hover:ring-gray-700">
              <div
                className={cn(
                  "flex items-center justify-center bg-gray-600 text-gray-200 font-medium shadow-md",
                  "transition-all duration-200",
                  variant === "circle" ? "rounded-full" : variant === "rounded" ? "rounded-lg" : "rounded-none",
                  sizeClasses[size],
                  onMoreClick && "cursor-pointer hover:bg-gray-500 hover:scale-110 hover:shadow-xl hover:text-white"
                )}
                onClick={onMoreClick}
                title={showTooltip ? `+${remainingCount} more users` : undefined}
              >
                +{remainingCount}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

UserAvatarGroup.displayName = "UserAvatarGroup";

export default UserAvatarGroup;