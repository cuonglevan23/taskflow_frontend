/**
 * Refactored Private Sidebar Component
 * Clean, optimized với custom hooks và sub-components
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { User } from "@/types/auth";
import { cn } from "@/lib/utils";
import { DARK_THEME } from "@/constants/theme";

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

// Constants
import { SIDEBAR_CLASSES, NAV_SECTIONS } from "../constants/sidebarConstants";

interface PrivateSidebarProps {
  user: User;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function PrivateSidebar({
  user,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: PrivateSidebarProps) {
  const pathname = usePathname();

  // Custom hooks for cleaner separation of concerns
  const { navigationSections, rbac, checkItemActive } = useSidebarNavigation();
  const { expandedSections, toggleSection } = useSidebarState(navigationSections);
  const { sidebarWidth, showLabels } = useSidebarDisplay(isCollapsed);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className={SIDEBAR_CLASSES.BACKDROP}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          SIDEBAR_CLASSES.CONTAINER,
          sidebarWidth,
          isOpen ? "translate-x-0" : "-translate-x-full",
          "sidebar-navigation"
        )}
        style={{ backgroundColor: DARK_THEME.sidebar.background, borderRightColor: DARK_THEME.sidebar.border, borderRightWidth: '1px' }}
      >
        {/* Fixed Main Navigation Section */}
        <div className="p-3 border-b" style={{ borderColor: DARK_THEME.border.default }}>
          {navigationSections
            .filter(section => section.id === NAV_SECTIONS.MAIN)
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
            .filter(section => section.id !== NAV_SECTIONS.MAIN)
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
        />
      </div>
    </>
  );
}