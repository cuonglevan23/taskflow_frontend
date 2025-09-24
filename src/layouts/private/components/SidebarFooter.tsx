/**
 * Sidebar Footer Component
 * Tách logic footer với role-based content
 */

import React from 'react';
import { Crown, Check } from 'lucide-react';


interface SidebarFooterProps {
  showLabels: boolean;
  rbac: any; // RBAC object from useRBAC hook
  onPremiumClick?: () => void;
  isPremiumUser?: boolean;
}

export default function SidebarFooter({ showLabels, rbac, onPremiumClick, isPremiumUser = false }: SidebarFooterProps) {
  const handlePremiumClick = () => {
    if (!isPremiumUser) {
      onPremiumClick?.();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      {isPremiumUser ? (
        // UI cho user đã premium - hiển thị trạng thái đã kích hoạt
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md">
          <Crown className="w-5 h-5" />
          <Check className="w-4 h-4" />
          {showLabels && (
            <span className="font-medium text-sm">
              Premium Active
            </span>
          )}
        </div>
      ) : (
        // UI cho user chưa premium - nút upgrade
        <button
          onClick={handlePremiumClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Crown className="w-5 h-5" />
          {showLabels && (
            <span className="font-medium text-sm">
              Upgrade Premium
            </span>
          )}
        </button>
      )}
    </div>
  );
}