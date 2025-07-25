"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  className?: string;
  contentClassName?: string;
}

export default function Dropdown({
  trigger,
  children,
  isOpen: controlledIsOpen,
  onOpenChange,
  placement = "bottom-left",
  className,
  contentClassName,
}: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const placementClasses = {
    "bottom-left": "top-full left-0 mt-1",
    "bottom-right": "top-full right-0 mt-1",
    "top-left": "bottom-full left-0 mb-1",
    "top-right": "bottom-full right-0 mb-1",
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 min-w-48 bg-white rounded-xl shadow-2xl border border-gray-100 transform transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95",
            placementClasses[placement],
            contentClassName
          )}
        >
          {children}
        </div>
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
        "w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out rounded-lg mx-2",
        className
      )}
    >
      {icon && <div className="mr-3 h-4 w-4">{icon}</div>}
      {children}
    </button>
  );
}

export interface DropdownSeparatorProps {
  className?: string;
}

export function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return (
    <div className={cn("my-2 mx-2 border-t border-gray-100", className)} />
  );
}
