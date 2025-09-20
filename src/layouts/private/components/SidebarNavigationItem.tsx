/**
 * Sidebar Navigation Item Component
 * Simplified - No role-based filtering
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/config/navigation';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";


interface SidebarNavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  showLabels: boolean;
}

export default function SidebarNavigationItem({ 
  item, 
  isActive, 
  isCollapsed, 
  showLabels 
}: SidebarNavigationItemProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const getItemTranslation = (item: NavigationItem, t: (key: string) => string) => {
    // Handle dynamic project items (project-1, project-2, etc.)
    if (item.id.startsWith('project-')) {
      return item.label; // Use the actual project name instead of trying to translate
    }

    // Handle dynamic team items (team-1, team-2, etc.)
    if (item.id.startsWith('team-')) {
      return item.label; // Use the actual team name instead of trying to translate
    }

    // For static navigation items, use the translation
    return t(`sidebar.items.${item.id}`);
  };

  return (
    <li>
      <Link
        href={item.href}
        prefetch={true}
        scroll={false}
        className={cn(
          "flex items-center rounded-md transition-colors duration-200",
          isCollapsed
            ? "p-2 justify-center"
            : "px-2 py-1.5 justify-between"
        )}
        style={{
          backgroundColor: isActive ? theme.background.secondary : 'transparent',
          color: isActive ? theme.text.primary : theme.text.secondary
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
            e.currentTarget.style.color = theme.text.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.text.secondary;
          }
        }}
        title={isCollapsed ? (getItemTranslation(item, t) || item.label) : undefined}
      >
        <div
          className={cn(
            "flex items-center min-w-0",
            isCollapsed ? "justify-center" : "gap-2"
          )}
        >
          {/* Icon */}
          {item.icon && (
            <span
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
              style={{ color: isActive ? theme.text.primary : theme.text.secondary }}
            >
              {item.icon}
            </span>
          )}

          {/* Label - hidden when collapsed */}
          {showLabels && (
            <span
              className="truncate text-sm font-medium"
              style={{ color: isActive ? theme.text.primary : theme.text.secondary }}
            >
              {getItemTranslation(item, t) || item.label}
            </span>
          )}
        </div>

        {/* Badge - only show when not collapsed */}
        {showLabels && item.badge && item.badge.count > 0 && (
          <span
            className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: theme.badge?.background || '#ef4444',
              color: theme.badge?.text || '#ffffff'
            }}
          >
            {item.badge.count}
          </span>
        )}
      </Link>
    </li>
  );
}