"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui";
import Dropdown, { DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown/Dropdown";
import { 
  Settings, 
  User, 
  Plus, 
  Users, 
  LogOut,
  Monitor,
  Crown
} from "lucide-react";
import { SettingsContainer } from "@/components/settings";
import { useAuth } from "@/components/auth/AuthProvider"; // ✅ FIX: Use AuthProvider instead of AuthService
import { SystemRole } from "@/constants/auth";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// Menu item interface for flexibility
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick: () => void;
  variant?: 'default' | 'danger';
  separator?: boolean;
}

interface UserMenuProps {
  user: User;
  onLogout?: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const { logout } = useAuth(); // ✅ FIX: Get logout from AuthProvider

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const router = useRouter();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Helper function to get display role
  const getDisplayRole = (role?: string): string => {
    if (!role) return t('userMenu.roles.member') || 'MEMBER';

    const normalizedRole = role.toUpperCase();

    // Map backend role to display role with translation
    switch (normalizedRole) {
      case 'ADMIN':
      case SystemRole.ADMIN:
        return t('userMenu.roles.admin') || 'ADMIN';
      case 'MEMBER':
      case SystemRole.MEMBER:
        return t('userMenu.roles.member') || 'MEMBER';
      default:
        return t('userMenu.roles.member') || 'MEMBER'; // Default fallback
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role?: string): string => {
    const displayRole = getDisplayRole(role);

    switch (displayRole) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MEMBER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ FIX: Simplified logout using AuthProvider
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // Use AuthProvider's logout method which handles everything properly
      await logout();

      // AuthProvider will handle redirect to login, but we can force redirect to public page
      router.replace('/');

    } catch (error) {
      // Force redirect to public page if logout fails
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't render if user is null
  if (!user) {
    return null;
  }

  // Menu items configuration
  const menuItems = [
    {
      id: 'profile',
      label: t('userMenu.profile') || 'Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => router.push('/profile/me/posts'),
    },
    {
      id: 'pricing',
      label: t('userMenu.pricing') || 'Pricing',
      icon: <Crown className="w-4 h-4" />,
      onClick: () => router.push('/pricing'),
    },
    {
      id: 'settings',
      label: t('userMenu.settings') || 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => setShowSettingsModal(true),
    },

  ];

  return (
    <>
      <div className="relative">
        <Dropdown
          trigger={
            <button className="flex items-center p-1 rounded hover:bg-gray-700 transition-colors ml-1">
              <UserAvatar
                user={user}
                size="sm"
                className="ring-1 ring-gray-600"
                showTooltip
              />
            </button>
          }
          placement="bottom-right"
          usePortal={false}
          contentClassName="w-64 max-w-xs"
        >
          {/* User Info Header */}
          <div className="p-4 border-b" style={{ borderColor: theme.border.default }}>
            <div className="flex items-center space-x-3">
              <UserAvatar
                user={user}
                size="md"
                className="ring-2 ring-orange-500"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-base truncate" style={{ color: theme.text.primary }}>
                  {user.name}
                </p>
                <p className="text-sm truncate" style={{ color: theme.text.secondary }}>
                  {user.email}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getDisplayRole(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <DropdownItem
                key={item.id}
                onClick={item.onClick}
                icon={item.icon}
              >
                <span className="text-sm" style={{ color: theme.text.primary }}>
                  {item.label}
                </span>
              </DropdownItem>
            ))}
          </div>

          {/* Logout Section */}
          <DropdownSeparator />
          <div className="py-1">
            <DropdownItem
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4" />}
              disabled={isLoggingOut}
            >
              <span className="text-red-400 text-sm font-medium">
                {isLoggingOut ? (t('userMenu.loggingOut') || 'Logging out...') : (t('userMenu.logout') || 'Log out')}
              </span>
            </DropdownItem>
          </div>
        </Dropdown>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsContainer
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  );
}
