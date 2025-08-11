"use client";

import React, { useState } from "react";
import { PrivateLayout } from "@/layouts";
import { useTheme } from "@/layouts/hooks/useTheme";
import { 
  FaPlus, 
  FaCheckCircle, 
  FaUsers, 
  FaChevronDown,
  FaEllipsisV
} from "react-icons/fa";
import { 
  MdKeyboardArrowDown,
  MdMoreHoriz
} from "react-icons/md";
import { 
  HiSparkles 
} from "react-icons/hi";
import { 
  IoCheckbox,
  IoCheckboxOutline 
} from "react-icons/io5";
import { 
  BsCircle,
  BsCheckCircle 
} from "react-icons/bs";

// Import Refactored Cards using BaseCard
import RefactoredMyTasksCard from "./components/Cards/MyTasksCard";
import RefactoredProjectsCard from "./components/Cards/ProjectsCard";
import RefactoredTasksAssignedCard from "./components/Cards/TasksAssignedCard";
import RefactoredGoalsCard from "./components/Cards/GoalsCard";

// Import Global Context
import { useTasksContext } from "@/contexts";
import { useTaskStats } from "@/hooks/useTasks";

// Base Card Types & Interfaces
interface TabConfig {
  key: string;
  label: string;
  count?: number | null;
}

interface ActionButtonConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

interface BaseCardProps {
  title: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
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
}

// Professional Base Card Component
const BaseCard = ({
  title,
  icon,
  avatar,
  tabs,
  activeTab,
  onTabChange,
  createAction,
  children,
  showMoreButton,
  className = "",
}: BaseCardProps) => {
  const { theme } = useTheme();

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
          {/* Avatar or Icon */}
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
          </div>
        </div>

        {/* Actions Menu */}
        <button 
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
        {/* Create/Add Action */}
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

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto min-h-0 mb-3">
          {children}
        </div>

        {/* Show More Action - Conditional */}
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

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
};

// Header Component
const HomeHeader = () => {
  const { theme } = useTheme();
  
  return (
    <div className="mb-8">
      <h1 
        className="text-2xl font-semibold mb-6"
        style={{ color: theme.text.primary }}
      >
        Home
      </h1>
    </div>
  );
};

// Greeting Section
const GreetingSection = () => {
  const { theme } = useTheme();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center mb-8">
      <p 
        className="text-sm mb-2"
        style={{ color: theme.text.secondary }}
      >
        {today}
      </p>
      <h2 
        className="text-2xl font-semibold"
        style={{ color: theme.text.primary }}
      >
        {getGreeting()}, levancuong
      </h2>
    </div>
  );
};

// Achievements Widget (Summary Bar) - Dynamic with Real Data
const AchievementsWidget = () => {
  const { theme } = useTheme();
  
  // Use global context for real-time task statistics
  const { stats: taskStats } = useTaskStats();
  
  return (
    <div className="flex justify-center mb-8">
      <div 
        className="flex items-center gap-8 px-8 py-4 rounded-2xl border"
        style={{
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
        }}
      >
        {/* My Week */}
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: theme.text.primary }}
          >
            My week
            <MdKeyboardArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Task Completed - Dynamic from Global Context */}
        <div className="flex items-center gap-2">
          <FaCheckCircle 
            className="w-4 h-4"
            style={{ color: "#10b981" }}
          />
          <span 
            className="text-sm"
            style={{ color: theme.text.primary }}
          >
            {taskStats?.byStatus?.completed || 0} task{(taskStats?.byStatus?.completed || 0) !== 1 ? 's' : ''} completed
          </span>
        </div>

        {/* Collaborators - Could be dynamic in future */}
        <div className="flex items-center gap-2">
          <FaUsers 
            className="w-4 h-4"
            style={{ color: theme.text.secondary }}
          />
          <span 
            className="text-sm"
            style={{ color: theme.text.primary }}
          >
            0 collaborators
          </span>
        </div>
      </div>
    </div>
  );
};









export default function HomeDashboard() {
  const { theme } = useTheme();

  return (
    <PrivateLayout>
        <div
          className="min-h-screen px-8 py-6"
          style={{
            backgroundColor: theme.background.secondary,
          }}
        >
          {/* Header */}
          <HomeHeader />

          {/* Greeting Section */}
          <GreetingSection />

          {/* Achievements Widget (Summary Bar) with Customize Button */}
          <div className="relative">
            <AchievementsWidget />
            
            {/* Customize Button - Positioned at top right */}
            <button 
              className="absolute top-0 right-8 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border"
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default,
                color: theme.text.primary,
              }}
            >
              <HiSparkles className="w-4 h-4" />
              Customize
            </button>
          </div>

          {/* Main Dashboard Grid - Using Refactored BaseCard Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">
            {/* Top Row */}
            <div className="h-[400px]">
              <RefactoredMyTasksCard />
            </div>
            <div className="h-[400px]">
              <RefactoredProjectsCard />
            </div>
            
            {/* Bottom Row */}
            <div className="h-[400px]">
              <RefactoredTasksAssignedCard />
            </div>
            <div className="h-[400px]">
              <RefactoredGoalsCard />
            </div>
          </div>
        </div>
      </PrivateLayout>
  );
}
