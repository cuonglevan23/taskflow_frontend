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
  Monitor
} from "lucide-react";
import { SettingsModal } from "@/components/features/Settings/SettingsModal";
import { AuthService } from "@/lib/auth-backend";

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
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// Menu section interface
export interface MenuSection {
  id: string;
  items: MenuItem[];
}

// UserMenu Props - Flexible and reusable
export interface UserMenuProps {
  user: User;
  onProfileSettings?: () => void;
  onDisplayPicture?: () => void;
  onNotificationSettings?: () => void;
  onSwitchTeams?: () => void;
  onCreateTeam?: () => void;
  onAdminConsole?: () => void;
  onInviteMembers?: () => void;
  onLogout?: () => void;
  className?: string;
  customMenuSections?: MenuSection[];
  showDefaultSections?: boolean;
}

// UserMenu Component - Professional & Reusable
const UserMenu = ({
  user,
  onProfileSettings,
  onDisplayPicture,
  onNotificationSettings,
  onSwitchTeams,
  onCreateTeam,
  onAdminConsole,
  onInviteMembers,
  onLogout,
  className = "",
  customMenuSections = [],
  showDefaultSections = true,
}: UserMenuProps) => {
  const router = useRouter();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout functionality with new AuthService
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    setIsLoggingOut(true);

    try {
      console.log('🚪 Starting logout process...');

      // Only call the onLogout callback (AuthProvider's logout method)
      // This will handle calling AuthService.logout() internally
      if (onLogout) {
        await onLogout();
      } else {
        // Fallback: if no onLogout provided, call AuthService directly
        await AuthService.logout();
      }

    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Fallback redirect if something goes wrong
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't render if user is null
  if (!user) {
    return null;
  }
  // Default menu sections - matches Asana design
  const defaultSections: MenuSection[] = [
    {
      id: 'workspace',
      items: [
        {
          id: 'admin-console',
          label: 'Admin console',
          onClick: onAdminConsole,
        },
        {
          id: 'new-workspace',
          label: 'New workspace',
          onClick: onCreateTeam,
        },
      ],
    },
    {
      id: 'invite',
      items: [
        {
          id: 'invite-to-asana',
          label: 'Invite to Asana',
          onClick: onInviteMembers,
        },
      ],
    },
    {
      id: 'account',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          onClick: () => router.push('/profile'),
        },
        {
          id: 'settings',
          label: 'Settings',
          onClick: () => setShowSettingsModal(true),
        },
        {
          id: 'add-account',
          label: 'Add another account',
          onClick: onDisplayPicture,
        },
      ],
    },
  ];

  // Combine default and custom sections
  const menuSections = showDefaultSections 
    ? [...defaultSections, ...customMenuSections]
    : customMenuSections;

  // Get icon for menu item
  const getMenuIcon = (itemId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'admin-console': <Monitor className="w-4 h-4" />,
      'new-workspace': <Plus className="w-4 h-4" />,
      'invite-to-asana': <Users className="w-4 h-4" />,
      'profile': <User className="w-4 h-4" />,
      'settings': <Settings className="w-4 h-4" />,
      'add-account': <Plus className="w-4 h-4" />,
      'logout': <LogOut className="w-4 h-4" />,
    };
    return iconMap[itemId] || null;
  };

  // Render menu section
  const renderMenuSection = (section: MenuSection, index: number) => (
    <React.Fragment key={section.id}>
      {index > 0 && <DropdownSeparator />}
      <div className="py-1">
        {section.items.map((item) => (
          <DropdownItem
            key={item.id}
            onClick={item.onClick}
            disabled={item.disabled}
            icon={getMenuIcon(item.id)}
          >
            <span 
              className={
                item.className || 
                (item.id === 'logout' ? 'text-red-400 text-sm font-medium' : 'text-gray-200 text-sm')
              }
            >
              {item.label}
            </span>
          </DropdownItem>
        ))}
      </div>
    </React.Fragment>
  );

  return (
    <>
      <div className={`relative ${className}`}>
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
          <div className="p-4 border-b" style={{ borderColor: '#374151' }}>
            <div className="flex items-center space-x-3">
              <UserAvatar
                user={user}
                size="md"
                className="ring-2 ring-orange-500"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-base truncate">
                  {user.name}
                </p>
                <p className="text-sm text-gray-400 truncate">
                  {user.email}
                </p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          {menuSections.map((section, index) => renderMenuSection(section, index))}

          {/* Logout Section - Always last */}
          <DropdownSeparator />
          <div className="py-1">
            <DropdownItem onClick={handleLogout} icon={<LogOut className="w-4 h-4" />}>
              <span className="text-red-400 text-sm font-medium">
                Log out
              </span>
            </DropdownItem>
          </div>
        </Dropdown>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal 
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={user}
          customBackdrop="rgba(66, 66, 68, .75)"
        />
      )}
    </>
  );
};

export default UserMenu;