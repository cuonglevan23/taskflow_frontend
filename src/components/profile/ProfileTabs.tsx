import React, { useCallback } from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { TabType } from '@/types/profile';

interface ProfileTab {
  id: TabType;
  label: string;
  count: number;
  href: string;
}

interface ProfileTabsProps {
  tabs: ProfileTab[];
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
}

export const ProfileTabs = React.memo<ProfileTabsProps>(({
  tabs,
  activeTab,
  onTabChange
}) => {
  const { theme } = useThemeContext();

  // Memoize individual tab click handlers to prevent recreation
  const handleTabClick = useCallback((tabId: TabType) => {
    onTabChange(tabId);
  }, [onTabChange]);

  return (
    <div className="border-b" style={{ borderColor: theme.border.default }}>
      <div className="px-4 sm:px-6">
        <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={isActive}
                onTabClick={handleTabClick}
              />
            );
          })}
        </nav>
      </div>
    </div>
  );
});

// Separate tab button component to prevent re-rendering of inactive tabs
const TabButton = React.memo<{
  tab: ProfileTab;
  isActive: boolean;
  onTabClick: (tabId: TabType) => void;
}>(({ tab, isActive, onTabClick }) => {
  const { theme } = useThemeContext();

  const handleClick = useCallback(() => {
    onTabClick(tab.id);
  }, [tab.id, onTabClick]);

  // Use a primary blue color for active state, or use status.info if available
  const primaryColor = theme.status?.info || '#3b82f6'; // fallback to blue-500

  return (
    <button
      onClick={handleClick}
      className="profile-nav-tab flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 group transition-colors duration-200"
      style={{
        color: isActive ? primaryColor : theme.text.secondary,
        borderBottomColor: isActive ? primaryColor : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = theme.text.primary;
          e.currentTarget.style.borderBottomColor = theme.border.muted;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = theme.text.secondary;
          e.currentTarget.style.borderBottomColor = 'transparent';
        }
      }}
    >
      <span className="hidden xs:inline">{tab.label}</span>
      {tab.count > 0 && (
        <span
          className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: theme.background.muted,
            color: theme.text.secondary
          }}
        >
          {tab.count}
        </span>
      )}
    </button>
  );
});

ProfileTabs.displayName = 'ProfileTabs';
TabButton.displayName = 'TabButton';
