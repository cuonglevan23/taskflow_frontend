/**
 * Sidebar Section Component
 * Simplified - No role-based filtering
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Shield, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { NavigationSection } from '@/config/navigation';
import SidebarNavigationItem from './SidebarNavigationItem';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface SidebarSectionProps {
  section: NavigationSection;
  isExpanded: boolean;
  onToggle: (sectionId: string) => void;
  isCollapsed: boolean;
  showLabels: boolean;
  pathname: string;
  checkItemActive: (item: any, pathname: string) => boolean;
}

export default function SidebarSection({
  section,
  isExpanded,
  onToggle,
  isCollapsed,
  showLabels,
  pathname,
  checkItemActive,
}: SidebarSectionProps) {
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

  // Render section header with role-specific icons
  const renderSectionHeader = () => {
    if (!section.title || !showLabels) return null;

    return (
      <button
        onClick={() => section.collapsible && onToggle(section.id)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
        style={{
          color: theme.text.secondary,
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
          e.currentTarget.style.color = theme.text.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = theme.text.secondary;
        }}
      >
        <span className="flex items-center gap-2">
          {/* Role-specific icons */}
          {section.id === "owner" && <Crown size={12} />}
          {section.id === "admin" && <Shield size={12} />}
          {t(`sidebar.sections.${section.id}`) || section.title}
        </span>
        {section.collapsible &&
          (isExpanded ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          ))}
      </button>
    );
  };

  return (
    <div className="mb-4">
      {/* Section Header */}
      {renderSectionHeader()}

      {/* Section Content */}
      {(!section.collapsible || isExpanded) && (
        <ul className="space-y-1 mt-2">

          {/* Navigation Items */}
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
      )}
    </div>
  );
}