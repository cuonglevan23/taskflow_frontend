"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonIconProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  iconClassName?: string;
  'aria-label': string;
  children?: React.ReactNode;
}

const ButtonIcon = React.forwardRef<HTMLButtonElement, ButtonIconProps>(
  ({
    icon: Icon,
    onClick,
    variant = 'default',
    size = 'md',
    disabled = false,
    className,
    iconClassName,
    'aria-label': ariaLabel,
    children,
    ...props
  }, ref) => {
    
    const baseStyles = "bg-transparent rounded-full transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantStyles = {
      default: "hover:bg-white/15 hover:text-white hover:shadow-lg dark:hover:bg-white/15 dark:hover:text-white focus:ring-white/30 transition-all duration-300",
      danger: "hover:bg-red-500/15 hover:text-red-100 hover:shadow-lg dark:hover:bg-red-400/15 dark:hover:text-red-100 focus:ring-red-500/30 transition-all duration-300",
      success: "hover:bg-green-500/15 hover:text-green-100 hover:shadow-lg dark:hover:bg-green-400/15 dark:hover:text-green-100 focus:ring-green-500/30 transition-all duration-300",
      warning: "hover:bg-orange-500/15 hover:text-orange-100 hover:shadow-lg dark:hover:bg-orange-400/15 dark:hover:text-orange-100 focus:ring-orange-500/30 transition-all duration-300"
    };
    
    const sizeStyles = {
      sm: "p-1",
      md: "p-1.5", 
      lg: "p-2"
    };
    
    const iconSizeStyles = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5"
    };
    
    const disabledStyles = "opacity-50 cursor-not-allowed hover:scale-100 hover:bg-transparent";

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          disabled && disabledStyles,
          className
        )}
        aria-label={ariaLabel}
        {...props}
      >
        {children || (
          <Icon 
            className={cn(
              iconSizeStyles[size],
              "transition-transform duration-200",
              iconClassName
            )} 
          />
        )}
      </button>
    );
  }
);

ButtonIcon.displayName = "ButtonIcon";

export default ButtonIcon;