import React from 'react';
import { DARK_THEME } from '@/constants/theme';
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

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="border-b" style={{ borderColor: DARK_THEME.border.default }}>
      <div className="px-4 sm:px-6">
        <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  profile-nav-tab flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm 
                  whitespace-nowrap flex-shrink-0 group
                  ${isActive 
                    ? 'border-blue-500 active text-blue-400' 
                    : 'border-transparent hover:text-gray-300 hover:border-gray-600'
                  }
                `}
                style={{
                  color: isActive ? '#60a5fa' : DARK_THEME.text.secondary
                }}
              >
                <span className="hidden xs:inline">{tab.label}</span>

              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
