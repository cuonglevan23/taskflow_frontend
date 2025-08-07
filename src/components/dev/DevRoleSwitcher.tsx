// Development Role Switcher Component
'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types/roles';
import { useMockAuth, MOCK_USERS } from '@/providers/MockAuthProvider';
import { getRoleDisplayName, getRoleColor, getRoleIcon } from '@/utils/roleUtils';
import { Button } from '@/components/ui';

interface DevRoleSwitcherProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

export const DevRoleSwitcher: React.FC<DevRoleSwitcherProps> = ({
  position = 'bottom-right',
  compact = false
}) => {
  const { user, switchRole, switchUser } = useMockAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);
  };

  const handleUserSwitch = (userId: string) => {
    switchUser(userId);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 shadow-lg"
        style={{ backgroundColor: getRoleColor(user.role) }}
        size={compact ? "sm" : "default"}
      >
        {getRoleIcon(user.role)} {compact ? '' : getRoleDisplayName(user.role)}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🔧 Dev Role Switcher
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current: <span className="font-medium">{user.name}</span>
            </div>
          </div>

          {/* Quick Role Switch */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Quick Role Switch:
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {(['admin', 'owner', 'project_manager', 'leader', 'member'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    user.role === role
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getRoleIcon(role)} {getRoleDisplayName(role)}
                </button>
              ))}
            </div>
          </div>

          {/* User Switch */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Switch User:
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {MOCK_USERS.map((mockUser) => (
                <button
                  key={mockUser.id}
                  onClick={() => handleUserSwitch(mockUser.id)}
                  className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                    user.id === mockUser.id
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{mockUser.name}</span>
                    <span 
                      className="px-1 rounded text-white text-[10px]"
                      style={{ backgroundColor: getRoleColor(mockUser.role) }}
                    >
                      {getRoleDisplayName(mockUser.role)}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {mockUser.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full text-xs py-1 px-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Compact version for smaller screens
export const DevRoleSwitcherCompact: React.FC = () => (
  <DevRoleSwitcher compact position="bottom-left" />
);

// Role indicator (always visible)
export const DevRoleIndicator: React.FC = () => {
  const { user } = useMockAuth();

  if (process.env.NODE_ENV !== 'development' || !user) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-40">
      <div 
        className="px-2 py-1 rounded-full text-white text-xs font-medium shadow-lg"
        style={{ backgroundColor: getRoleColor(user.role) }}
      >
        {getRoleIcon(user.role)} {getRoleDisplayName(user.role)}
      </div>
    </div>
  );
};