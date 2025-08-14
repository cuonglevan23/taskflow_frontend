"use client";

import React from "react";
import PrivateHeader from "./PrivateHeader";
import PrivateSidebar from "./PrivateSidebar";
import {
  useLayoutContext,
  useLayoutActions,
} from "../context/PrivateLayoutContext";
import { DetailPanel } from "@/components/features/DetailPanel";

interface PrivateLayoutContentProps {
  children: React.ReactNode;
}

export default function PrivateLayoutContent({
  children,
}: PrivateLayoutContentProps) {
  const { user, isSidebarOpen, isSidebarCollapsed } = useLayoutContext();
  const { toggleSidebar, setSidebarOpen, toggleSidebarCollapse, signOut } =
    useLayoutActions();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Don't render if user is null (during logout process)
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Header - Fixed at top */}
      <PrivateHeader
        user={user}
        onSidebarToggle={toggleSidebar}
        onSidebarCollapseToggle={toggleSidebarCollapse}
        isSidebarCollapsed={isSidebarCollapsed}
        onLogout={signOut}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <PrivateSidebar
          user={user}
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={closeSidebar}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Content */}
        <div
          className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
          style={{
            marginLeft: isSidebarOpen
              ? isSidebarCollapsed
                ? "4rem"
                : "16rem"
              : "0",
          }}
        >
          <main
            className="flex-1 overflow-auto relative"
            style={{
              overscrollBehavior: "none",
              overscrollBehaviorX: "none",
              overscrollBehaviorY: "none",
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
