"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { ChevronDown, Grid3X3, List } from "lucide-react";
import DashboardCard, { type Dashboard } from "./DashboardCard";
import CreateDashboardCard from "./CreateDashboardCard";

// Dashboard Section Props - Reusable for different sections
export interface DashboardSectionProps {
  title: string;
  dashboards: Dashboard[];
  viewMode?: 'tiles' | 'list';
  isExpanded?: boolean;
  showCreateCard?: boolean;
  showViewToggle?: boolean;
  createLabel?: string;
  className?: string;
  onToggleExpanded?: () => void;
  onViewModeChange?: (mode: 'tiles' | 'list') => void;
  onDashboardClick?: (dashboard: Dashboard) => void;
  onCreateClick?: () => void;
}

// Dashboard Section Component - Reusable & Professional
export default function DashboardSection({
  title,
  dashboards,
  viewMode = 'tiles',
  isExpanded = true,
  showCreateCard = true,
  showViewToggle = true,
  createLabel = 'Create dashboard',
  className = '',
  onToggleExpanded,
  onViewModeChange,
  onDashboardClick,
  onCreateClick,
}: DashboardSectionProps) {
  const { theme } = useTheme();

  const handleViewModeToggle = () => {
    onViewModeChange?.(viewMode === 'tiles' ? 'list' : 'tiles');
  };

  return (
    <div className={`mb-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2"
          onClick={onToggleExpanded}
        >
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            style={{ color: theme.text.secondary }}
          />
          <h2 
            className="text-lg font-semibold"
            style={{ color: theme.text.primary }}
          >
            {title}
          </h2>
        </button>

        {showViewToggle && (
          <button 
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.text.secondary }}
            onClick={handleViewModeToggle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={viewMode === 'tiles' ? 'Switch to list view' : 'Switch to tiles view'}
          >
            {viewMode === 'tiles' ? (
              <List className="w-5 h-5" />
            ) : (
              <Grid3X3 className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Dashboard Content */}
      {isExpanded && (
        <div className={
          viewMode === 'tiles' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
            : "space-y-3"
        }>
          {/* Create Dashboard Card */}
          {showCreateCard && (
            <CreateDashboardCard 
              viewMode={viewMode}
              onClick={onCreateClick}
              label={createLabel}
            />
          )}
          
          {/* Dashboard Cards */}
          {dashboards.map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              viewMode={viewMode}
              onClick={onDashboardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

