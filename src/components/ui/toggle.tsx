import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant = "default", size = "default", pressed, onPressedChange, disabled, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      default: pressed ? "bg-gray-700 text-white" : "bg-transparent hover:bg-gray-700 hover:text-gray-200",
      outline: pressed ? "border border-gray-500 bg-gray-700 text-white" : "border border-gray-600 bg-transparent hover:bg-gray-700 hover:text-gray-200",
    };

    const sizeClasses = {
      default: "h-10 px-3",
      sm: "h-9 px-2.5",
      lg: "h-11 px-5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        onClick={() => onPressedChange?.(!pressed)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
)

Toggle.displayName = "Toggle"

export { Toggle }