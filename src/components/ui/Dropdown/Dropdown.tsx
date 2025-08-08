"use client";

import { useState, useRef, useCallback, useMemo, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Portal from "../Portal/Portal";
import { Z_INDEX } from "@/styles/z-index";
import { useTheme } from "@/layouts/hooks/useTheme";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: "bottom-left" | "bottom-right" | "top-left" | "top-right" | "right" | "left";
  className?: string;
  contentClassName?: string;
  usePortal?: boolean; // Professional option to render in portal
}

export default function Dropdown({
  trigger,
  children,
  isOpen: controlledIsOpen,
  onOpenChange,
  placement = "bottom-left",
  className,
  contentClassName,
  usePortal = false,
}: DropdownProps) {
  const { theme } = useTheme();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = useCallback((open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  }, [onOpenChange]);

  // Calculate position only when needed - no state to prevent re-renders
  const getPortalPosition = useCallback(() => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
      top: rect.bottom + scrollTop,
      left: rect.left + scrollLeft,
    };
  }, []);

  // Memoized click outside handler to prevent re-renders
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, [setIsOpen]);

  // Proper event listener management - no flicker
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside, { passive: true });
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  const placementClasses = {
    "bottom-left": "top-full left-0 mt-1",
    "bottom-right": "top-full right-0 mt-1",
    "top-left": "bottom-full left-0 mb-1",
    "top-right": "bottom-full right-0 mb-1",
    "right": "top-0 left-full ml-1",
    "left": "top-0 right-full mr-1",
  };

  // Memoized dropdown content to prevent unnecessary re-renders
  const dropdownContent = useMemo(() => {
    if (!isOpen) return null;

    const portalPosition = usePortal ? getPortalPosition() : {};

    return (
      <div
        ref={dropdownRef}
        className={cn(
          "min-w-48 rounded-xl shadow-lg border",
          usePortal ? "fixed" : "absolute",
          !usePortal && placementClasses[placement],
          contentClassName
        )}
        style={{
          backgroundColor: theme.background.primary, // Use theme instead of hardcoded
          borderColor: theme.border.default,         // Use theme instead of hardcoded
          zIndex: Z_INDEX.dropdown,
          ...portalPosition,
        }}
      >
        {children}
      </div>
    );
  }, [isOpen, usePortal, placement, contentClassName, theme.background.primary, theme.border.default, children, getPortalPosition]);

  return (
    <div className={cn("relative inline-block", className)}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {usePortal ? (
        <Portal>{dropdownContent}</Portal>
      ) : (
        dropdownContent
      )}
    </div>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  icon,
  disabled = false,
  className,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center px-4 py-2 text-sm text-left",
        "text-gray-700 dark:text-gray-200",
        "hover:bg-gray-100 dark:hover:bg-gray-700/50",
        "hover:text-gray-900 dark:hover:text-white",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className
      )}
    >
      {icon && <div className="mr-3 h-4 w-4 flex-shrink-0">{icon}</div>}
      {children}
    </button>
  );
}

export interface DropdownSeparatorProps {
  className?: string;
}

export function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return (
    <div className={cn("my-2 mx-2 border-t border-gray-200 dark:border-gray-600", className)} />
  );
}
