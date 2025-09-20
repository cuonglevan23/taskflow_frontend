"use client";

import React from "react";
import PrivateHeader from "./PrivateHeader";
import PrivateSidebar from "./PrivateSidebar";
import { DetailPanel } from "@/components/features/DetailPanel";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";

interface PrivateLayoutContentProps {
  children: React.ReactNode;
}

export default function PrivateLayoutContent({ children }: PrivateLayoutContentProps) {
  const { theme } = useThemeContext();
  const { user, isLoading } = useAuth();

  // Simple loading
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ FIX: Always render layout structure, even without user data
  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme.background.primary }}>
      {/* Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <PrivateHeader
          user={user || { id: '1', email: 'loading@example.com', name: 'Loading...', role: 'USER' }}
          onSidebarToggle={() => {}}
          onSidebarCollapseToggle={() => {}}
          isSidebarCollapsed={false}
          onLogout={() => {}}
        />
      </div>

      {/* Main Content Area - Add top padding to account for fixed header */}
      <div className="flex flex-1 overflow-hidden pt-12">
        {/* Sidebar - Fixed positioning */}
        <div className="fixed left-0 top-12 h-[calc(100vh-3rem)] z-40">
          <PrivateSidebar
            user={user || { id: '1', email: 'loading@example.com', name: 'Loading...', role: 'USER' }}
            isOpen={true}
            isCollapsed={false}
            onClose={() => {}}
            onToggleCollapse={() => {}}
          />
        </div>

        {/* Content - Adjust margin for fixed sidebar */}
        <div
          className="flex-1 flex flex-col min-w-0 ml-64"
          style={{ backgroundColor: theme.background.primary }}
        >
          <main
            className="flex-1 overflow-auto relative"
            style={{
              backgroundColor: theme.background.primary,
              overscrollBehavior: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {children}
          </main>
        </div>

        {/* Detail Panel */}
        <DetailPanel />
      </div>
    </div>
  );
}
