"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "circle" | "rounded" | "square";
  className?: string;
  status?: "online" | "offline" | "away" | "busy";
  showStatus?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name = "",
      size = "md",
      variant = "circle",
      className,
      status,
      showStatus = false,
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const sizeClasses = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
      xl: "h-16 w-16 text-xl",
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
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const handleImageError = () => {
      console.log('🔍 Avatar image failed to load:', { src, name, alt });
      setImageError(true);
      setImageLoading(false);
    };

    const handleImageLoad = () => {
      console.log('🔍 Avatar image loaded successfully:', { src, name });
      setImageError(false);
      setImageLoading(false);
    };

    // Show initials if no src, image error, or while loading
    const showInitials = !src || imageError;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden bg-gray-100",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        style={style}
        onClick={onClick}
        {...props}
      >
        {src && !imageError && (
          <img
            src={src}
            alt={alt || name}
            className="h-full w-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading || imageError ? 'none' : 'block' }}
          />
        )}
        
        {showInitials && (
          <span className="font-medium text-gray-600">{getInitials(name)}</span>
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
  }
);

Avatar.displayName = "Avatar";

export default Avatar;
