/**
 * Sidebar Section Component
 * Tách logic render từng navigation section
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Shield, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RBACGuard } from '@/components/guards/RBACGuard';
import { UserRole, Permission } from '@/constants/auth';
import type { NavigationSection } from '@/config/rbac-navigation';
import { SIDEBAR_CLASSES, NAV_SECTIONS } from '../constants/sidebarConstants';
import SidebarNavigationItem from './SidebarNavigationItem';

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
  const router = useRouter();

  // Render section header with role-specific icons
  const renderSectionHeader = () => {
    if (!section.title || !showLabels) return null;

    return (
      <button
        onClick={() => section.collapsible && onToggle(section.id)}
        className={SIDEBAR_CLASSES.SECTION_HEADER}
      >
        <span className="flex items-center gap-2">
          {/* Role-specific icons */}
          {section.id === "owner" && <Crown size={12} />}
          {section.id === "admin" && <Shield size={12} />}
          {section.title}
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

  // Render quick action buttons for specific sections
  const renderQuickActions = () => {
    if (!showLabels) return null;

    const quickActions = [];

    // Projects section - Create projects button
    if (section.id === NAV_SECTIONS.PROJECTS) {
      quickActions.push(
        <li key="create-project">
          <RBACGuard
            minimumRole={UserRole.PM}
            permissions={[Permission.CREATE_PROJECT]}
            showFallback={false}
          >
            <button
              onClick={() => router.push("/projects/create")}
              className={SIDEBAR_CLASSES.CREATE_BUTTON}
            >
              <Plus size={16} />
              <span>Create project</span>
            </button>
          </RBACGuard>
        </li>
      );
    }

    // Teams section - Create team button
    if (section.id === NAV_SECTIONS.TEAMS) {
      quickActions.push(
        <li key="create-team">
          <RBACGuard
            minimumRole={UserRole.PM}
            permissions={[Permission.CREATE_TEAM]}
            showFallback={false}
          >
            <button
              onClick={() => router.push("/teams/create")}
              className={SIDEBAR_CLASSES.CREATE_BUTTON}
            >
              <Plus size={16} />
              <span>Create team</span>
            </button>
          </RBACGuard>
        </li>
      );
    }

    return quickActions;
  };

  // Check if section content should be shown
  const shouldShowContent = () => {
    return !section.title || !section.collapsible || isExpanded;
  };

  return (
    <RBACGuard
      roles={section.allowedRoles}
      minimumRole={section.minimumRole}
      permissions={section.requiredPermissions}
      showFallback={false}
    >
      <div className="mb-4">
        {renderSectionHeader()}

        {shouldShowContent() && (
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

            {/* Quick action buttons */}
            {renderQuickActions()}
          </ul>
        )}
      </div>
    </RBACGuard>
  );
}