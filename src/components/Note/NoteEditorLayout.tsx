"use client";

import { ReactNode } from 'react';
import { DARK_THEME } from '@/constants/theme';

interface NoteEditorLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  showSidebar?: boolean;
  header?: ReactNode;
  onToggleSidebar?: () => void;
}

export default function NoteEditorLayout({
  children,
  sidebar,
  showSidebar = false,
  header,
  onToggleSidebar
}: NoteEditorLayoutProps) {
  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: DARK_THEME.background.primary }}>
      {/* Header/Toolbar area - always at top */}
      {header && (
        <div className="flex-shrink-0">
          {header}
        </div>
      )}

      {/* Main content area with sidebar */}
      <div className="flex-1 flex h-full overflow-hidden">
        {/* TOC Toggle Button - only show when sidebar is closed */}
        {!showSidebar && (
          <div className="flex-shrink-0 flex flex-col">
            <button
              onClick={onToggleSidebar}
              className="m-2 mt-12 ml-6"
              style={{ color: DARK_THEME.text.muted }}
              title="Show Table of Contents"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        )}

        {/* TOC Sidebar - with close button inside */}
        {showSidebar && sidebar && (
          <div
            className="w-64  border-opacity-20 flex-shrink-0 overflow-hidden flex flex-col"
            style={{
              backgroundColor: DARK_THEME.background.primary,
              borderColor: DARK_THEME.border.default
            }}
          >
            {/* Sidebar header with close button */}
            <div className="flex items-center justify-between p-3 " style={{ borderColor: DARK_THEME.border.default }}>
              <span className="text-sm font-medium" style={{ color: DARK_THEME.text.primary }}>
                Table of Contents
              </span>
              <button
                onClick={onToggleSidebar}
                className="p-1 rounded "
                style={{ color: DARK_THEME.text.muted }}
                title="Hide Table of Contents"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-auto">
              {sidebar}
            </div>
          </div>
        )}

        {/* Main note content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
