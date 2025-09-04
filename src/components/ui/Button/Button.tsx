"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'button_text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    ...props
  }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantStyles = {
      default: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500",
      primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm hover:shadow-md",
      secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500 shadow-sm",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md",
      outline: "border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500",
      ghost: "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500",
      button_text: "border border-[#4573d2] hover:border-[#3462c1] focus:ring-[#4573d2]"
    };
    
    const sizeStyles = {
      sm: "h-8 px-3 text-sm",
      md: "h-9 px-4 text-sm", 
      lg: "h-10 px-6 text-base"
    };

    // Custom style cho button_text variant
    const buttonTextStyle = variant === 'button_text' ? {
      height: '28px',
      padding: '0 12px',
      fontSize: '12px',
      lineHeight: '28px',
      background: '#4573d2',
      borderColor: '#4573d2',
      color: '#2a2b2d',
      marginTop: '12px',
      border: '1px solid #4573d2',
      borderRadius: '6px'
    } : {};

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          variant === 'button_text' ? "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border" : baseStyles,
          variant !== 'button_text' && variantStyles[variant],
          variant !== 'button_text' && sizeStyles[size],
          variant === 'button_text' && variantStyles[variant],
          className
        )}
        style={{
          ...buttonTextStyle,
          ...props.style
        }}
        {...props}
      >
        {loading && (
          <div className={cn(
            "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
            children && "mr-2"
          )} />
        )}
        {!loading && leftIcon && (
          <span className={children ? "mr-2" : ""}>{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className={children ? "ml-2" : ""}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;