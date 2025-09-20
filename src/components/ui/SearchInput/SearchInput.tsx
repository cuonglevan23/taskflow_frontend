"use client";

import React, { useCallback } from "react";
import { Search, X } from "lucide-react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  showShortcut?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "bordered";
}

const SearchInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  showShortcut = true,
  className = "",
  size = "md",
  variant = "default",
}: SearchInputProps) => {
  // Theme and Language Context
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  // Get default placeholder from i18n if not provided
  const defaultPlaceholder = messages?.search?.placeholder || "Search...";
  const actualPlaceholder = placeholder || defaultPlaceholder;

  // Size variants
  const sizeClasses = {
    sm: "py-2 pl-9 pr-16 text-sm",
    md: "py-2.5 pl-10 pr-18 text-sm", 
    lg: "py-3 pl-12 pr-20 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const iconPositions = {
    sm: "left-2.5",
    md: "left-3",
    lg: "left-3.5",
  };

  // Get search styles from theme
  const searchStyles = {
    background: theme.search.background,
    backgroundStrong: theme.search.backgroundStrong,
    backgroundActive: theme.search.backgroundActive,
    text: theme.search.text,
    placeholder: theme.text.muted,
    border: theme.border.default,
    focus: theme.border.focus,
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className={`absolute inset-y-0 ${iconPositions[size]} flex items-center pointer-events-none`}>
        <Search 
          size={iconSizes[size]} 
          style={{ color: searchStyles.placeholder }}
        />
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder={actualPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`w-full rounded-full transition-all duration-200 outline-none ${sizeClasses[size]}`}
        style={{
          backgroundColor: searchStyles.background,
          borderColor: searchStyles.border,
          borderWidth: '1px',
          color: searchStyles.text,
        }}
        onFocusCapture={(e) => {
          e.target.style.backgroundColor = searchStyles.backgroundActive;
          e.target.style.borderColor = searchStyles.focus;
        }}
        onBlurCapture={(e) => {
          e.target.style.backgroundColor = searchStyles.background;
          e.target.style.borderColor = searchStyles.border;
        }}
      />
      
      {/* Custom CSS for placeholder */}
      <style jsx>{`
        input::placeholder {
          color: ${searchStyles.placeholder} !important;
        }
      `}</style>

      {/* Right Side Actions */}
      <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="transition-colors p-0.5 rounded"
            style={{ 
              color: searchStyles.placeholder,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = searchStyles.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = searchStyles.placeholder;
            }}
            aria-label={messages?.search?.clearSearch || "Clear search"}
            title={messages?.search?.clearSearch || "Clear search"}
          >
            <X size={iconSizes[size] - 2} />
          </button>
        )}

        {/* Keyboard Shortcut */}
        {showShortcut && !value && (
          <kbd 
            className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded"
            style={{
              color: searchStyles.placeholder,
              backgroundColor: searchStyles.backgroundStrong,
              borderColor: searchStyles.border,
              borderWidth: '1px',
            }}
            title={messages?.search?.shortcutHint || "Press ⌘K to search"}
          >
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
};

export default SearchInput;