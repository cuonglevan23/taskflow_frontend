"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { 
  FaProjectDiagram,
  FaStar,
  FaTasks,
  FaArchive
} from "react-icons/fa";
import { type Portfolio } from "@/hooks";

// Portfolio Statistics Interface - Type Safe
export interface PortfolioStatsData {
  total: number;
  active: number;
  starred: number;
  archived: number;
  totalProjects: number;
  totalTasks: number;
  averageProgress: number;
}

// Individual Stat Item Component - Reusable
const StatItem = ({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color?: string;
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Icon 
        className="w-4 h-4"
        style={{ color: color || theme.text.secondary }}
      />
      <span 
        className="text-sm"
        style={{ color: theme.text.primary }}
      >
        {value} {label}
      </span>
    </div>
  );
};

// Main Portfolio Stats Widget Component - Professional & Modular
interface PortfolioStatsWidgetProps {
  stats: PortfolioStatsData;
  showDetailed?: boolean;
  className?: string;
}

const PortfolioStatsWidget = ({
  stats,
  showDetailed = false,
  className = ""
}: PortfolioStatsWidgetProps) => {
  const { theme } = useTheme();

  // Basic stats that are always shown
  const basicStats = [
    {
      icon: FaProjectDiagram,
      label: "total projects",
      value: stats.totalProjects,
      color: theme.text.secondary
    },
    {
      icon: FaStar,
      label: "starred",
      value: stats.starred,
      color: "#f97316" // Orange for starred
    },
    {
      icon: FaTasks,
      label: "total tasks", 
      value: stats.totalTasks,
      color: theme.text.secondary
    }
  ];

  // Detailed stats shown when requested
  const detailedStats = [
    ...basicStats,
    {
      icon: FaArchive,
      label: "archived",
      value: stats.archived,
      color: theme.text.secondary
    }
  ];

  const statsToShow = showDetailed ? detailedStats : basicStats;

  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        className="flex items-center gap-8 px-8 py-4 rounded-2xl border"
        style={{
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
        }}
      >
        {statsToShow.map((stat, index) => (
          <StatItem
            key={`${stat.label}-${index}`}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
        
        {/* Average Progress - Special formatting */}
        {showDetailed && stats.averageProgress > 0 && (
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center"
            >
              <div 
                className="w-2 h-2 rounded-full bg-green-500"
                style={{ opacity: stats.averageProgress / 100 }}
              />
            </div>
            <span 
              className="text-sm"
              style={{ color: theme.text.primary }}
            >
              {stats.averageProgress}% avg progress
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioStatsWidget;