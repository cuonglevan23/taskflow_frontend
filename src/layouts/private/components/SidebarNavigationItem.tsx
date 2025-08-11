/**
 * Sidebar Navigation Item Component
 * Tách logic render từng navigation item
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { RBACGuard } from '@/components/guards/RBACGuard';
import type { NavigationItem } from '@/config/rbac-navigation';
import { SIDEBAR_CLASSES, BADGE_COLORS } from '../constants/sidebarConstants';

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
  return (
    <li>
      <RBACGuard
        roles={item.allowedRoles}
        minimumRole={item.minimumRole}
        permissions={item.requiredPermissions}
        showFallback={false}
      >
        <Link
          href={item.href}
          className={cn(
            SIDEBAR_CLASSES.NAV_ITEM_BASE,
            isCollapsed
              ? "p-2 justify-center"
              : "px-2 py-1.5 justify-between",
            isActive
              ? SIDEBAR_CLASSES.NAV_ITEM_ACTIVE
              : SIDEBAR_CLASSES.NAV_ITEM_INACTIVE
          )}
          title={isCollapsed ? item.label : undefined}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
        >
          <div
            className={cn(
              "flex items-center min-w-0",
              isCollapsed ? "justify-center" : "space-x-3"
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {showLabels && (
              <span className="truncate">{item.label}</span>
            )}
          </div>
          
          {item.badge && showLabels && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              BADGE_COLORS[item.badge.color || "default"]
            )}>
              {item.badge.text || item.badge.count}
            </span>
          )}
        </Link>
      </RBACGuard>
    </li>
  );
}