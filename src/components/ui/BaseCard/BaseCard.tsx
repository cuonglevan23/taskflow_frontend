"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { MdMoreHoriz } from "react-icons/md";

// Professional TypeScript Interfaces
export interface TabConfig {
  key: string;
  label: string;
  count?: number | null;
}

export interface ActionButtonConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

export interface BaseCardProps {
  title: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  lockIcon?: boolean;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tabKey: string) => void;
  createAction?: ActionButtonConfig;
  children: React.ReactNode;
  showMoreButton?: {
    show: boolean;
    onClick: () => void;
  };
  className?: string;
  onMenuClick?: () => void;
}

// Professional BaseCard Component - Senior Product Code
const BaseCard = ({
  title,
  icon,
  avatar,
  lockIcon = false,
  tabs,
  activeTab,
  onTabChange,
  createAction,
  children,
  showMoreButton,
  className = "",
  onMenuClick,
}: BaseCardProps) => {
  const { theme } = useTheme();

  // Tab Button Sub-Component
  const TabButton = ({ 
    tab, 
    isActive, 
    onClick 
  }: { 
    tab: TabConfig; 
    isActive: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="relative pb-3 pr-6 text-sm font-medium transition-all duration-200 hover:opacity-80"
      style={{
        color: isActive ? theme.text.primary : theme.text.secondary,
      }}
    >
      <span className="whitespace-nowrap">
        {tab.label}
        {tab.count !== null && tab.count !== undefined && (
          <span className="ml-1">({tab.count})</span>
        )}
      </span>
      {isActive && (
        <div 
          className="absolute bottom-0 left-0 right-6 h-0.5 bg-orange-500"
          style={{ borderRadius: '2px' }}
        />
      )}
    </button>
  );

  return (
    <div 
      className={`rounded-2xl border h-full flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
      }}
    >
      {/* Professional Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Avatar with Dashed Border */}
          {avatar && (
            <div 
              className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: theme.text.secondary + '60' }}
            >
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: theme.text.secondary + '20' }}
              >
                {avatar}
              </div>
            </div>
          )}

          {/* Regular Icon */}
          {icon && !avatar && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          
          {/* Title Section */}
          <div className="flex items-center gap-2">
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.text.primary }}
            >
              {title}
            </h3>
            {lockIcon && (
              <span 
                className="text-base opacity-70"
                style={{ color: theme.text.secondary }}
              >
                🔒
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg transition-colors duration-200"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <MdMoreHoriz 
            className="w-5 h-5"
            style={{ color: theme.text.secondary }}
          />
        </button>
      </div>

      {/* Navigation Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="px-6">
          <div 
            className="flex border-b"
            style={{ borderBottomColor: theme.border.default }}
          >
            {tabs.map((tab) => (
              <TabButton
                key={tab.key}
                tab={tab}
                isActive={activeTab === tab.key}
                onClick={() => onTabChange?.(tab.key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-6 py-4 min-h-0">
        {/* Create/Add Action Button */}
        {createAction && (
          <button 
            onClick={createAction.onClick}
            className="flex items-center gap-3 text-sm py-2 px-2 -mx-2 rounded-lg transition-colors duration-200 mb-3 flex-shrink-0"
            style={{ color: theme.text.secondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <createAction.icon className="w-4 h-4" />
            <span>{createAction.label}</span>
          </button>
        )}

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 mb-3">
          {children}
        </div>

        {/* Show More Action - Conditional Rendering */}
        {showMoreButton?.show && (
          <div className="flex-shrink-0 border-t pt-3" style={{ borderColor: theme.border.default }}>
            <button 
              onClick={showMoreButton.onClick}
              className="text-sm py-2 px-2 -mx-2 text-left rounded-lg transition-colors duration-200 w-full"
              style={{ 
                color: theme.text.secondary,
                fontSize: '14px',
                fontWeight: '400'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.secondary;
              }}
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseCard;