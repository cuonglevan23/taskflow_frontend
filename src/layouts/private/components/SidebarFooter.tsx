/**
 * Sidebar Footer Component
 * Tách logic footer với role-based content
 */

import React from 'react';
import Link from 'next/link';
import { Crown, Shield, Settings, CreditCard } from 'lucide-react';
import { RBACGuard } from '@/components/guards/RBACGuard';
import { UserRole } from '@/constants/auth';

interface SidebarFooterProps {
  showLabels: boolean;
  rbac: any; // RBAC object from useRBAC hook
}

export default function SidebarFooter({ showLabels, rbac }: SidebarFooterProps) {
  return (
    <div className="p-3 border-t border-gray-700 bg-gray-800">
      {showLabels ? (
        <div className="text-xs text-gray-400 space-y-1">
          {/* Role-based trial and billing info */}
          <RBACGuard minimumRole={UserRole.OWNER} showFallback={false}>
            <div className="flex items-center justify-between">
              <span>Trial: 11d left</span>
              <Link
                href="/owner/billing"
                className="text-orange-400 hover:text-orange-300 text-xs flex items-center gap-1"
              >
                <CreditCard size={12} />
                Upgrade
              </Link>
            </div>
            <Link
              href="/owner/billing"
              className="text-orange-400 hover:text-orange-300 text-xs block"
            >
              Add billing info →
            </Link>
          </RBACGuard>

          {/* Role indicator */}
          <div className="flex items-center justify-between pt-2">
            <span className="flex items-center gap-1">
              {rbac.isOwner && <Crown size={12} className="text-yellow-400" />}
              {rbac.isAdmin && <Shield size={12} className="text-blue-400" />}
              {rbac.isProjectManager && <Settings size={12} className="text-green-400" />}
              <span className="capitalize">{rbac.role?.toLowerCase().replace('_', ' ')}</span>
            </span>
            
            {/* Support link for all users */}
            <Link
              href="/support"
              className="text-gray-400 hover:text-gray-300 text-xs"
              title="Support"
            >
              ?
            </Link>
          </div>

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => rbac.debug()}
              className="text-gray-500 hover:text-gray-400 text-xs"
            >
              Debug RBAC
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          {/* Collapsed view with role indicator */}
          <div className="flex justify-center">
            {rbac.isOwner && <Crown size={16} className="text-yellow-400" />}
            {rbac.isAdmin && <Shield size={16} className="text-blue-400" />}
            {rbac.isProjectManager && <Settings size={16} className="text-green-400" />}
            {rbac.isLeader && <span className="text-green-300 text-xs">L</span>}
            {rbac.isMember && <span className="text-gray-300 text-xs">M</span>}
          </div>
          
          <RBACGuard minimumRole={UserRole.OWNER} showFallback={false}>
            <Link
              href="/owner/billing"
              className="text-orange-400 hover:text-orange-300 text-xs p-1"
              title="Upgrade"
            >
              ⚡
            </Link>
          </RBACGuard>
        </div>
      )}
    </div>
  );
}