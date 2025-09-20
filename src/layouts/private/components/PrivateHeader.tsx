"use client";

import React from "react";
import { User } from "@/layouts/types";
import Dropdown, {
  DropdownItem,
} from "@/components/ui/Dropdown/Dropdown";
import SearchPanel from "./SearchPanel";
import UserMenu from "./UserMenu";
import { CreateButton } from "@/components/features/create";
import { GiHamburgerMenu } from "react-icons/gi";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { AI_COPILOT_COLORS } from "@/constants/theme";
import { CustomChatAssistant } from "@/components/icons/CustomChatAssistant";

interface PrivateHeaderProps {
  user: User;
  onSidebarToggle: () => void;
  onSidebarCollapseToggle: () => void;
  isSidebarCollapsed: boolean;
  onLogout?: () => void;
}

export default function PrivateHeader({
  user,
  onSidebarToggle,
  onSidebarCollapseToggle,
  isSidebarCollapsed,
  onLogout,
}: PrivateHeaderProps) {
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

  const handleSearch = (query: string) => {
    // Handle search logic here
    console.log("Searching for:", query);
  };

  const handleCreateAction = (actionId: string) => {
    console.log(`Create action triggered: ${actionId}`);
  };


  return (
    <header
      className="h-12 flex items-center justify-between px-4 border-b"
      style={{
        backgroundColor: theme.header.background,
        borderColor: theme.border.default
      }}
    >
      {/* Left Section - Menu and Create */}
      <div className="flex items-center space-x-2">
        {/* Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-1.5 rounded transition-colors"
          style={{
            color: theme.text.secondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.text.primary;
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.text.secondary;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <GiHamburgerMenu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className="hidden lg:flex p-1.5 rounded transition-colors"
          style={{
            color: theme.text.secondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.text.primary;
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.text.secondary;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title={t('header.toggleSidebar') || 'Toggle sidebar'}
        >
          <GiHamburgerMenu className="h-5 w-5" />
        </button>

        {/* Create Button */}
        <CreateButton onActionClick={handleCreateAction} />
      </div>

      {/* Center Section - Search Panel */}
      <div className="flex-1 flex items-center justify-center mx-4">
        <SearchPanel onSearch={handleSearch} className="w-full max-w-2xl" />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Chat Assistant */}
        <button
          className="p-1.5 rounded transition-all duration-200 relative overflow-hidden"
          title={t('header.chatAssistant') || 'Chat Assistant'}
          onClick={() => console.log("Chat Assistant clicked")}
          style={{
            background: `linear-gradient(135deg, ${AI_COPILOT_COLORS.avatarBackground1}, ${AI_COPILOT_COLORS.avatarBackground2})`,
            borderColor: `linear-gradient(135deg, ${AI_COPILOT_COLORS.avatarBackground1}, ${AI_COPILOT_COLORS.avatarBackground2})`,
            color: AI_COPILOT_COLORS.iconColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, rgba(255, 90, 76, 0.25), rgba(0, 134, 255, 0.25))`;
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${AI_COPILOT_COLORS.avatarBackground1}, ${AI_COPILOT_COLORS.avatarBackground2})`;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <CustomChatAssistant className="h-5 w-5" style={{ color: AI_COPILOT_COLORS.iconColor }} />
        </button>

        {/* User Menu */}
        <UserMenu
          user={user}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
