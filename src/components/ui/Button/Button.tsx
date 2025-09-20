"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

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
    ...rest
  }, ref) => {
    const { theme } = useThemeContext();
    const { messages } = useLanguageContext();

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeStyles = {
      sm: "h-8 px-3 text-sm",
      md: "h-9 px-4 text-sm", 
      lg: "h-10 px-6 text-base"
    };

    // Get variant styles from theme
    const getVariantStyle = (variant: string) => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: theme.button.secondary.background,
            color: theme.button.secondary.text,
            borderColor: theme.button.secondary.border,
          };
        case 'primary':
          return {
            backgroundColor: theme.button.primary.background,
            color: theme.button.primary.text,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          };
        case 'secondary':
          return {
            backgroundColor: theme.background.muted,
            color: theme.text.primary,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          };
        case 'danger':
          return {
            backgroundColor: theme.status.error,
            color: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            color: theme.text.primary,
            borderColor: theme.border.default,
            borderWidth: '1px',
            borderStyle: 'solid',
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: theme.text.primary,
          };
        case 'button_text':
          return {
            height: '28px',
            padding: '0 12px',
            fontSize: '12px',
            lineHeight: '28px',
            backgroundColor: theme.status.info || '#4573d2',
            borderColor: theme.status.info || '#4573d2',
            color: theme.text.inverse,
            marginTop: '12px',
            border: `1px solid ${theme.status.info || '#4573d2'}`,
            borderRadius: '6px'
          };
        default:
          return {};
      }
    };

    // Get hover styles
    const getHoverHandlers = (variant: string) => {
      return {
        onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled || loading) return;

          switch (variant) {
            case 'default':
              e.currentTarget.style.backgroundColor = theme.button.secondary.hover;
              break;
            case 'primary':
              e.currentTarget.style.backgroundColor = theme.button.primary.hover;
              break;
            case 'secondary':
              e.currentTarget.style.backgroundColor = theme.background.secondary;
              break;
            case 'danger':
              e.currentTarget.style.backgroundColor = theme.status.error;
              e.currentTarget.style.filter = 'brightness(0.9)';
              break;
            case 'outline':
              e.currentTarget.style.backgroundColor = theme.background.muted;
              break;
            case 'ghost':
              e.currentTarget.style.backgroundColor = theme.background.muted;
              break;
            case 'button_text':
              e.currentTarget.style.backgroundColor = theme.status.info || '#3462c1';
              break;
          }
        },
        onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled || loading) return;

          const originalStyle = getVariantStyle(variant);
          Object.assign(e.currentTarget.style, originalStyle);
          if (variant !== 'danger') {
            e.currentTarget.style.filter = '';
          }
        }
      };
    };

    const variantStyle = getVariantStyle(variant);
    const hoverHandlers = getHoverHandlers(variant);

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variant !== 'button_text' && sizeStyles[size],
          variant === 'outline' && 'border',
          className
        )}
        style={{
          ...variantStyle,
          ...rest.style
        }}
        {...hoverHandlers}
        {...rest}
      >
        {loading && (
          <div className={cn(
            "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
            children ? "mr-2" : ""
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