/**
 * Refactored Private Sidebar Component
 * Clean, optimized với custom hooks và sub-components
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { User } from "@/layouts/types";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

// Custom hooks and utilities
import { 
  useSidebarNavigation, 
  useSidebarState, 
  useSidebarDisplay 
} from "../hooks/useSidebarNavigation";

// Components
import SidebarSection from "./SidebarSection";
import SidebarFooter from "./SidebarFooter";
import SidebarNavigationItem from "./SidebarNavigationItem";

interface PrivateSidebarProps {
  user: User;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onPremiumClick?: () => void;
  isPremiumUser?: boolean;
}

export default function PrivateSidebar({
  user,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  onPremiumClick,
  isPremiumUser = false,
}: PrivateSidebarProps) {
  const { theme, isLoading } = useThemeContext();
  const { messages } = useLanguageContext();
  const pathname = usePathname();

  // Don't render if theme is still loading to prevent flash of incorrect colors
  if (isLoading) {
    return null;
  }

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Custom hooks for cleaner separation of concerns
  const { navigationSections, rbac, checkItemActive } = useSidebarNavigation();
  const { expandedSections, toggleSection } = useSidebarState(navigationSections);
  const { sidebarWidth, showLabels } = useSidebarDisplay(isCollapsed);

  // Define sidebar styles using theme context
  const sidebarContainerClasses = cn(
    "fixed top-12 left-0 h-[calc(100vh-3rem)] z-[60] transform transition-all duration-300 ease-in-out flex flex-col",
    sidebarWidth,
    isOpen ? "translate-x-0" : "-translate-x-full",
    "sidebar-navigation"
  );

  const backdropClasses = "fixed inset-0  bg-opacity-50 z-30";

  return (
    <>
      {/* Mobile backdrop - chỉ hiện trên mobile */}
      {isOpen && typeof window !== 'undefined' && window.innerWidth < 1024 && (
        <div
          className={backdropClasses}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={sidebarContainerClasses}
        style={{
          backgroundColor: theme.sidebar.background,
          borderRightColor: theme.sidebar.border,
          borderRightWidth: '1px'
        }}
      >
        {/* Fixed Main Navigation Section */}
        <div
          className="p-3 border-b"
          style={{ borderColor: theme.border.default }}
        >
          {navigationSections
            .filter(section => section.id === 'main')
            .map((section) => (
              <div key={section.id}>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarNavigationItem
                      key={item.id}
                      item={item}
                      isActive={checkItemActive(item, pathname)}
                      isCollapsed={isCollapsed}
                      showLabels={showLabels}
                    />
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 min-h-0">
          {navigationSections
            .filter(section => section.id !== 'main')
            .map((section) => (
              <SidebarSection
                key={section.id}
                section={section}
                isExpanded={expandedSections.includes(section.id)}
                onToggle={toggleSection}
                isCollapsed={isCollapsed}
                showLabels={showLabels}
                pathname={pathname}
                checkItemActive={checkItemActive}
              />
            ))}
        </nav>

        {/* Role-Based Footer */}
        <SidebarFooter 
          showLabels={showLabels} 
          rbac={rbac}
          onPremiumClick={onPremiumClick}
          isPremiumUser={isPremiumUser}
        />
      </div>
    </>
  );
}