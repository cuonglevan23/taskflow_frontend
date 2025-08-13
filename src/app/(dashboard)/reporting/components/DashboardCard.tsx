"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { BarChart3 } from "lucide-react";

// Dashboard interface - reusable across app
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  color: string;
  owner: {
    id: string;
    name: string;
    initials: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  isRecent?: boolean;
  tags?: string[];
}

// Dashboard Card Props - type-safe and flexible
export interface DashboardCardProps {
  dashboard: Dashboard;
  viewMode?: 'tiles' | 'list';
  onClick?: (dashboard: Dashboard) => void;
  className?: string;
  showOwner?: boolean;
  showDescription?: boolean;
}

// Dashboard Card Component - Reusable & Professional
export default function DashboardCard({
  dashboard,
  viewMode = 'tiles',
  onClick,
  className = '',
  showOwner = true,
  showDescription = true,
}: DashboardCardProps) {
  const { theme } = useTheme();

  const handleClick = () => {
    onClick?.(dashboard);
  };

  // List View Layout
  if (viewMode === 'list') {
    return (
      <div
        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md flex items-center gap-4 ${className}`}
        style={{
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
        }}
        onClick={handleClick}
      >
        {/* Dashboard Icon */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: dashboard.color }}
        >
          <BarChart3 className="w-5 h-5 text-white" />
        </div>

        {/* Dashboard Info */}
        <div className="flex-1 min-w-0">
          <h3 
            className="text-base font-semibold truncate"
            style={{ color: theme.text.primary }}
          >
            {dashboard.name}
          </h3>
          {showDescription && dashboard.description && (
            <p 
              className="text-sm truncate mt-1"
              style={{ color: theme.text.secondary }}
            >
              {dashboard.description}
            </p>
          )}
        </div>

        {/* Owner Info */}
        {showOwner && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-medium">
              {dashboard.owner.initials}
            </div>
            <span 
              className="text-sm"
              style={{ color: theme.text.secondary }}
            >
              owned by you
            </span>
          </div>
        )}
      </div>
    );
  }

  // Tiles View Layout (Default)
  return (
    <div
      className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 ${className}`}
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
      }}
      onClick={handleClick}
    >
      {/* Dashboard Icon */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: dashboard.color }}
        >
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Dashboard Info */}
      <div className="mb-4">
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: theme.text.primary }}
        >
          {dashboard.name}
        </h3>
        {showDescription && dashboard.description && (
          <p 
            className="text-sm"
            style={{ color: theme.text.secondary }}
          >
            {dashboard.description}
          </p>
        )}
      </div>

      {/* Owner Info */}
      {showOwner && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-medium">
            {dashboard.owner.initials}
          </div>
          <span 
            className="text-sm"
            style={{ color: theme.text.secondary }}
          >
            owned by you
          </span>
        </div>
      )}
    </div>
  );
};

