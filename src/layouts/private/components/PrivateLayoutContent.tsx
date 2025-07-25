"use client";

import { useEffect } from "react";
import { PrivateLayoutProps } from "../../types";
import {
  useLayoutContext,
  useLayoutActions,
} from "../context/PrivateLayoutContext";
import PrivateHeader from "./PrivateHeader";
import PrivateSidebar from "./PrivateSidebar";
import PrivateMain from "./PrivateMain";

export default function PrivateLayoutContent({
  children,
  showBreadcrumbs = true,
  enableSearch = true,
  enableNotifications = true,
  sidebarVariant = "default",
  headerVariant = "default",
  className = "",
  onNavigate,
}: PrivateLayoutProps) {
  const context = useLayoutContext();
  const actions = useLayoutActions();

  // Handle clicks outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (context.isUserMenuOpen && !target.closest("[data-user-menu]")) {
        actions.setUserMenuOpen(false);
      }

      if (
        context.isSidebarOpen &&
        window.innerWidth < 1024 &&
        !target.closest("[data-sidebar]")
      ) {
        actions.setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [context.isUserMenuOpen, context.isSidebarOpen, actions]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        actions.toggleSidebar();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        const searchInput = document.querySelector(
          "[data-search-input]"
        ) as HTMLInputElement;
        searchInput?.focus();
      }

      if (event.key === "Escape") {
        if (context.isUserMenuOpen) {
          actions.setUserMenuOpen(false);
        }
        if (context.isSidebarOpen && window.innerWidth < 1024) {
          actions.setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [context.isUserMenuOpen, context.isSidebarOpen, actions]);

  if (!context.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      <PrivateHeader
        user={context.user}
        notifications={context.notifications}
        unreadCount={context.unreadNotificationCount}
        searchQuery={context.searchQuery}
        searchResults={context.searchResults}
        isUserMenuOpen={context.isUserMenuOpen}
        onSearchChange={actions.setSearchQuery}
        onUserMenuToggle={actions.toggleUserMenu}
        onSidebarToggle={actions.toggleSidebar}
        onNotificationClick={actions.markNotificationAsRead}
        onSignOut={actions.signOut}
        variant={headerVariant}
        enableSearch={enableSearch}
        enableNotifications={enableNotifications}
      />

      <PrivateSidebar
        user={context.user}
        navigation={context.navigation}
        currentPath={context.currentPath}
        isOpen={context.isSidebarOpen}
        onClose={() => actions.setSidebarOpen(false)}
        onNavigate={onNavigate}
        variant={sidebarVariant}
      />

      <PrivateMain
        breadcrumbs={showBreadcrumbs ? context.breadcrumbs : undefined}
        showBreadcrumbs={showBreadcrumbs}
      >
        {children}
      </PrivateMain>

      {context.isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => actions.setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
