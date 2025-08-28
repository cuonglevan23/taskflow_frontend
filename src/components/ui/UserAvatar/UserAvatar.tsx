"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth/types";

export interface UserAvatarProps {
  user?: AuthUser | null;
  name?: string;
  email?: string;
  avatar?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "circle" | "rounded" | "square";
  className?: string;
  status?: "online" | "offline" | "away" | "busy";
  showStatus?: boolean;
  showTooltip?: boolean;
  fallbackColor?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>(
  (
    {
      user,
      name: propName,
      email: propEmail,
      avatar: propAvatar,
      size = "md",
      variant = "circle",
      className,
      status,
      showStatus = false,
      showTooltip = false,
      fallbackColor,
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    // Extract user data with fallbacks - handle both AuthUser.image and UserProfile.avatar
    const name = user?.name || propName || "";
    const email = user?.email || propEmail || "";
    const avatar = propAvatar || (user as any)?.avatar || user?.image;

    const sizeClasses = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
      xl: "h-16 w-16 text-xl",
      "2xl": "h-20 w-20 text-2xl",
    };

    const variantClasses = {
      circle: "rounded-full",
      rounded: "rounded-lg",
      square: "rounded-none",
    };

    const statusColors = {
      online: "bg-green-500",
      offline: "bg-gray-400",
      away: "bg-yellow-500",
      busy: "bg-red-500",
    };

    const getInitials = (name: string): string => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const getAvatarColor = (name: string): string => {
      if (fallbackColor) return fallbackColor;
      
      // Generate consistent color based on name
      const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-yellow-500",
        "bg-red-500",
        "bg-teal-500",
        "bg-orange-500",
        "bg-cyan-500",
      ];
      
      const hash = name.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      return colors[Math.abs(hash) % colors.length];
    };

    const avatarElement = (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden",
          avatar ? "bg-gray-100" : getAvatarColor(name),
          sizeClasses[size],
          variantClasses[variant],
          onClick && "cursor-pointer hover:opacity-80 transition-opacity",
          className
        )}
        style={style}
        onClick={onClick}
        title={showTooltip ? `${name} (${email})` : undefined}
        {...props}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name || "User avatar"}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="font-medium text-white">${getInitials(name)}</span>`;
                parent.className = parent.className.replace("bg-gray-100", getAvatarColor(name));
              }
            }}
            onLoad={(e) => {
              // Ensure image is visible when loaded successfully
              const target = e.target as HTMLImageElement;
              if (target) {
                target.style.display = "block";
              }
            }}
          />
        ) : (
          <span className="font-medium text-white">{getInitials(name)}</span>
        )}

        {showStatus && status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
              statusColors[status]
            )}
          />
        )}
      </div>
    );

    return avatarElement;
  }
);

UserAvatar.displayName = "UserAvatar";

export default UserAvatar;