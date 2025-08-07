"use client";

import { forwardRef } from "react";
import { ButtonProps } from "@/types";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      onClick,
      type = "button",
      icon,
      fullWidth = false,
      shape = "default",
      state = "default",
      className = "",
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";

    const variantClasses = {
      // Primary variants
      primary: "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 shadow-md hover:shadow-lg active:scale-95",
      "primary-gradient": "bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 focus:ring-orange-500 shadow-md hover:shadow-lg active:scale-95",
      
      // Secondary variants
      secondary: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow active:scale-98",
      "secondary-solid": "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500 active:scale-98",
      
      // Success variants
      success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-md hover:shadow-lg active:scale-95",
      "success-gradient": "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 shadow-md hover:shadow-lg active:scale-95",
      
      // Danger variants
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg active:scale-95",
      destructive: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg active:scale-95",
      "danger-gradient": "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 focus:ring-red-500 shadow-md hover:shadow-lg active:scale-95",
      
      // Warning variants
      warning: "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 shadow-md hover:shadow-lg active:scale-95",
      "warning-gradient": "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 focus:ring-orange-500 shadow-md hover:shadow-lg active:scale-95",
      
      // Info variants
      info: "bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500 shadow-md hover:shadow-lg active:scale-95",
      "info-gradient": "bg-gradient-to-r from-cyan-600 to-orange-600 text-white hover:from-cyan-700 hover:to-orange-700 focus:ring-cyan-500 shadow-md hover:shadow-lg active:scale-95",
      
      // Ghost variants
      ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500 active:scale-98",
      "ghost-colored": "bg-transparent hover:bg-orange-50 dark:hover:bg-orange-950 text-orange-600 dark:text-orange-400 focus:ring-orange-500 active:scale-98",
      
      // Outline variants
      outline: "border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-gray-500 active:scale-98",
      "outline-primary": "border border-orange-600 bg-transparent text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 hover:border-orange-700 focus:ring-orange-500 active:scale-98",
      "outline-success": "border border-green-600 bg-transparent text-green-600 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-700 focus:ring-green-500 active:scale-98",
      "outline-danger": "border border-red-600 bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-700 focus:ring-red-500 active:scale-98",
      "outline-warning": "border border-orange-600 bg-transparent text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 hover:border-orange-700 focus:ring-orange-500 active:scale-98",
      
      // Soft variants
      "soft-primary": "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 focus:ring-orange-500 active:scale-98",
      "soft-success": "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 focus:ring-green-500 active:scale-98",
      "soft-danger": "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 focus:ring-red-500 active:scale-98",
      "soft-warning": "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 focus:ring-orange-500 active:scale-98",
      
      // Link variant
      link: "bg-transparent text-orange-600 dark:text-orange-400 underline-offset-4 hover:underline focus:ring-orange-500 active:scale-95",
    };

    const sizeClasses = {
      xs: "h-6 px-2 text-xs gap-1",
      sm: "h-8 px-3 text-sm gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-10 px-6 text-base gap-2",
      xl: "h-11 px-8 text-base gap-2.5",
      "2xl": "h-12 px-10 text-lg gap-3",
    };

    const shapeClasses = {
      default: "rounded-lg",
      rounded: "rounded-full",
      square: "rounded-none",
      pill: "rounded-full px-6",
    };

    const stateClasses = {
      default: "",
      selected: "ring-2 ring-orange-200 dark:ring-orange-800 bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100",
      active: "ring-2 ring-orange-200 dark:ring-orange-800 shadow-lg scale-95",
      loading: "cursor-not-allowed",
    };

    const classes = [
      baseClasses,
      variantClasses[variant] || variantClasses.primary,
      sizeClasses[size] || sizeClasses.md,
      shapeClasses[shape] || shapeClasses.default,
      stateClasses[state] || stateClasses.default,
      fullWidth ? "w-full" : "",
      loading ? "cursor-not-allowed" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading || state === "loading"}
        onClick={onClick}
        className={classes}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {loading ? (
          <LoadingSpinner />
        ) : leftIcon || icon ? (
          <span className={children ? "mr-2" : ""}>{leftIcon || icon}</span>
        ) : null}
        
        {/* Button content */}
        {children}
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className={children ? "ml-2" : ""}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
