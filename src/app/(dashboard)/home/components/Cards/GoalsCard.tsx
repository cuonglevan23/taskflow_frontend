"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import BaseCard, { type TabConfig, type ActionButtonConfig } from "@/components/ui/BaseCard";
import { FaPlus } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useTasksContext, type Goal } from "@/contexts";

// Professional GoalsCard using BaseCard & Direct Context - Senior Product Code
const GoalsCard = () => {
  const { theme } = useTheme();
  
  // Use direct context to avoid activeTab conflicts
  // TODO: Implement goals SWR hooks
  // For now, provide empty data to prevent errors
  const goals = [];
  const addGoal = async () => {};
  const updateGoalProgress = async () => {};
  const isLoading = false;

  const [activeTab, setActiveTab] = React.useState("my-goals");

  // Business Logic
  const getStatusColor = (status: Goal['status']): string => {
    switch (status) {
      case 'on-track':
        return '#10b981';
      case 'at-risk':
        return '#f59e0b';
      case 'off-track':
        return '#ef4444';
      default:
        return '#10b981';
    }
  };

  const getStatusText = (status: Goal['status']): string => {
    switch (status) {
      case 'on-track':
        return 'On track';
      case 'at-risk':
        return 'At risk';
      case 'off-track':
        return 'Off track';
      default:
        return 'On track';
    }
  };

  // Goal Item Component
  const GoalItem = ({ goal }: { goal: Goal }) => (
    <div
      className="p-2 rounded-lg transition-colors cursor-pointer"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.background.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Goal Header */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-medium text-xs truncate"
          style={{ color: theme.text.primary }}
        >
          {goal.name}
        </span>
        <span
          className="text-xs flex-shrink-0 ml-2"
          style={{ color: theme.text.secondary }}
        >
          {goal.progress}%
        </span>
      </div>

      {/* Goal Period */}
      {goal.period && (
        <p
          className="text-xs mb-2"
          style={{ color: theme.text.secondary }}
        >
          {goal.period}
        </p>
      )}

      {/* Progress Bar */}
      <div
        className="w-full rounded-full h-1.5 mb-1"
        style={{ backgroundColor: theme.background.muted }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${goal.progress}%`,
            backgroundColor: goal.progress > 0 ? getStatusColor(goal.status) : '#e5e7eb',
          }}
        ></div>
      </div>

      {/* Status */}
      <span
        className="text-xs block"
        style={{ color: getStatusColor(goal.status) }}
      >
        {getStatusText(goal.status)}
      </span>
    </div>
  );

  // Custom Header Component for Goals
  const GoalsHeader = () => (
    <div className="flex items-center gap-2 mb-3">
      <button className="flex items-center gap-1">
        <span
          className="text-xs"
          style={{ color: theme.text.secondary }}
        >
          Open goals
        </span>
        <MdKeyboardArrowDown className="w-3 h-3" style={{ color: theme.text.secondary }} />
      </button>
    </div>
  );

  // BaseCard Configuration
  const tabs: TabConfig[] = [
    { key: "my-goals", label: "My goals", count: null },
    { key: "team", label: "Team", count: null }
  ];

  // Business Logic using Hook
  const handleCreateGoal = () => {
    addGoal({
      name: "New Goal",
      progress: 0,
      status: 'on-track',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      ownerId: 'current-user'
    });
  };

  const handleMenuClick = () => {
    console.log("Goals menu clicked - Total goals:", goals.length);
  };

  const createAction: ActionButtonConfig = {
    icon: FaPlus,
    label: "Create goal",
    onClick: handleCreateGoal
  };

  return (
    <BaseCard
      title="Goals"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      createAction={createAction}
      onMenuClick={handleMenuClick}
      fullHeight={true}
    >
      <div className="space-y-2 h-full flex flex-col">
        {/* Custom Header */}
        <GoalsHeader />

        {/* Goals List - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
          {goals && goals.length > 0 ? goals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} />
          )) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-sm" style={{ color: theme.text.secondary }}>
                No goals found
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
};

export default GoalsCard;