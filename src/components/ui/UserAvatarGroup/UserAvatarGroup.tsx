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
    const visibleUsers = users.slice(0, max);
    const remainingCount = Math.max(0, users.length - max);

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
            className="relative ring-2 ring-white hover:z-10 transition-all duration-200"
            style={{ zIndex: visibleUsers.length - index }}
          >
            <UserAvatar
              user={user}
              size={size}
              variant={variant}
              showTooltip={showTooltip}
              onClick={() => onUserClick?.(user)}
              className="transition-transform hover:scale-110"
            />
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            className={cn(
              "relative ring-2 ring-white hover:z-10 transition-all duration-200",
              "flex items-center justify-center bg-gray-200 text-gray-600 font-medium",
              variant === "circle" ? "rounded-full" : variant === "rounded" ? "rounded-lg" : "rounded-none",
              sizeClasses[size],
              onMoreClick && "cursor-pointer hover:bg-gray-300 hover:scale-110"
            )}
            onClick={onMoreClick}
            title={showTooltip ? `+${remainingCount} more users` : undefined}
            style={{ zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

UserAvatarGroup.displayName = "UserAvatarGroup";

export default UserAvatarGroup;