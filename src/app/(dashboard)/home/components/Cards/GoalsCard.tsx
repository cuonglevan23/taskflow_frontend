"use client";

import React from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import BaseCard, { type TabConfig, type ActionButtonConfig } from "@/components/ui/BaseCard";
import { FaPlus } from "react-icons/fa";
import { GoalsProvider, useGoals } from "@/contexts/GoalsContext";
import { useTeamGoals } from "@/hooks/process/useTeamGoals";
import { useTeamProgress } from "@/hooks/process/useTeamProgress";

// Professional GoalsCard Content Component
const GoalsCardContent = () => {
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

  // State management
  const [activeTab, setActiveTab] = React.useState("my-goals");
  const [showAllGoals, setShowAllGoals] = React.useState(false);

  // Get data from different sources based on active tab
  const myGoalsData = useGoals();
  const teamGoalsData = useTeamGoals();
  const teamProgressData = useTeamProgress();

  // Compute current data based on active tab
  const currentData = React.useMemo(() => {
    if (activeTab === "my-goals") {
      return {
        goals: myGoalsData?.filteredGoals || [],
        loading: myGoalsData?.loading || false,
        error: myGoalsData?.error || null
      };
    } else {
      // For team goals, we'll use team progress data
      return {
        goals: teamProgressData?.teamsProgress || [],
        loading: teamProgressData?.loading || teamGoalsData?.loading || false,
        error: teamProgressData?.error || teamGoalsData?.error || null
      };
    }
  }, [activeTab, myGoalsData, teamGoalsData, teamProgressData]);

  // Display logic with show more/less functionality
  const displayedGoals = React.useMemo(() => {
    const goals = currentData.goals || [];
    return showAllGoals ? goals : goals.slice(0, 4);
  }, [currentData.goals, showAllGoals]);

  // Check if there are more goals to show
  const hasMoreGoals = React.useMemo(() => {
    return (currentData.goals?.length || 0) > 4;
  }, [currentData.goals]);

  // Helper function to toggle show all
  const toggleShowAll = () => setShowAllGoals(!showAllGoals);

  // Team Progress Item Component (for team tab)
  const TeamProgressItem = ({ teamProgress }: { teamProgress: any }) => {
    const progressPercentage = teamProgress.totalTasks > 0
      ? Math.round((teamProgress.completedTasks / teamProgress.totalTasks) * 100)
      : 0;

    return (
      <div
        className="p-3 rounded-lg transition-colors cursor-pointer border-b"
        style={{ borderBottomColor: theme.border.default }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Team Header */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="font-medium text-sm truncate"
            style={{ color: theme.text.primary }}
          >
            {teamProgress.teamName || `Team ${teamProgress.teamId}`}
          </span>
          <span
            className="text-xs flex-shrink-0 ml-2"
            style={{ color: theme.text.secondary }}
          >
            {progressPercentage}%
          </span>
        </div>

        {/* Team Stats */}
        <div className="flex items-center gap-4 mb-2">
          <span
            className="text-xs"
            style={{ color: theme.text.secondary }}
          >
            {teamProgress.completedTasks}/{teamProgress.totalTasks} tasks
          </span>
          <span
            className="text-xs"
            style={{ color: theme.text.secondary }}
          >
            {teamProgress.members?.length || 0} members
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full rounded-full h-2"
          style={{ backgroundColor: theme.background.muted }}
        >
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: progressPercentage >= 80 ? '#10b981' :
                             progressPercentage >= 50 ? '#f59e0b' : '#ef4444'
            }}
          ></div>
        </div>
      </div>
    );
  };

  // Goal Item Component (for my goals tab)
  const MyGoalItem = ({ goal }: { goal: any }) => (
    <div
      className="p-3 rounded-lg transition-colors cursor-pointer border-b"
      style={{ borderBottomColor: theme.border.default }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.background.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Goal Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-medium text-sm truncate"
          style={{ color: theme.text.primary }}
        >
          {goal.title || goal.name || 'Untitled Goal'}
        </span>
        <span
          className="text-xs flex-shrink-0 ml-2"
          style={{ color: theme.text.secondary }}
        >
          {goal.progress || 0}%
        </span>
      </div>

      {/* Goal Description */}
      {goal.description && (
        <p
          className="text-xs mb-2 line-clamp-2"
          style={{ color: theme.text.secondary }}
        >
          {goal.description}
        </p>
      )}

      {/* Progress Bar */}
      <div
        className="w-full rounded-full h-2 mb-2"
        style={{ backgroundColor: theme.background.muted }}
      >
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${goal.progress || 0}%`,
            backgroundColor: (goal.progress || 0) >= 80 ? '#10b981' :
                           (goal.progress || 0) >= 50 ? '#f59e0b' : '#ef4444'
          }}
        ></div>
      </div>

      {/* Goal Status */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs"
          style={{
            color: (goal.progress || 0) >= 80 ? '#10b981' :
                   (goal.progress || 0) >= 50 ? '#f59e0b' : '#ef4444'
          }}
        >
          {(goal.progress || 0) >= 80 ? 'On track' :
           (goal.progress || 0) >= 50 ? 'At risk' : 'Behind'}
        </span>
        {goal.targetDate && (
          <span
            className="text-xs"
            style={{ color: theme.text.secondary }}
          >
            Due: {new Date(goal.targetDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );

  // Business Logic using real hooks
  const handleCreateGoal = () => {
    console.log("Create goal clicked");
    // TODO: Implement goal creation
  };

  const handleMenuClick = () => {
    console.log("Goals menu clicked - Active tab:", activeTab, "Total items:", displayedGoals.length);
  };

  // BaseCard Configuration with counts
  const tabs: TabConfig[] = [
    {
      key: "my-goals",
      label: "My goals",
      count: activeTab === "my-goals" ? (currentData.goals?.length || 0) : null
    },
    {
      key: "team",
      label: "Team",
      count: activeTab === "team" ? (currentData.goals?.length || 0) : null
    }
  ];

  const createAction: ActionButtonConfig = {
    icon: FaPlus,
    label: activeTab === "my-goals" ? "Create goal" : "View teams",
    onClick: handleCreateGoal
  };

  // Show More Button Configuration
  const showMoreButton = {
    show: hasMoreGoals,
    onClick: toggleShowAll,
    label: showAllGoals ? t('common.showLess') : t('common.showMore')
  };

  return (
    <BaseCard
      title="Goals"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      createAction={createAction}
      showMoreButton={showMoreButton}
      onMenuClick={handleMenuClick}
      fullHeight={true}
    >
      <div className={`space-y-0 h-full flex flex-col ${showAllGoals ? 'overflow-hidden' : ''}`}>
        {/* Loading state */}
        {currentData.loading && (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <span className="text-sm" style={{ color: theme.text.secondary }}>
              {activeTab === "my-goals" ? "Loading goals..." : "Loading team progress..."}
            </span>
          </div>
        )}

        {/* Error state */}
        {!currentData.loading && currentData.error && (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <span className="text-sm text-red-500">
              Error loading {activeTab === "my-goals" ? "goals" : "team progress"}
            </span>
          </div>
        )}

        {/* Goals/Teams display */}
        {!currentData.loading && !currentData.error && displayedGoals && displayedGoals.length > 0 && (
          <div className={`flex-1 ${showAllGoals ? 'overflow-y-auto space-y-0' : 'space-y-0'}`}>
            {displayedGoals.map((item, index) => (
              activeTab === "my-goals" ? (
                <MyGoalItem key={item.id || index} goal={item} />
              ) : (
                <TeamProgressItem key={(item as any).teamId || index} teamProgress={item} />
              )
            ))}
          </div>
        )}

        {/* Empty state */}
        {!currentData.loading && !currentData.error && (!displayedGoals || displayedGoals.length === 0) && (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {activeTab === "my-goals" ? "🎯" : "👥"}
              </div>
              <span className="text-sm" style={{ color: theme.text.secondary }}>
                {activeTab === "my-goals" ? "No goals found" : "No team progress found"}
              </span>
            </div>
          </div>
        )}
      </div>
    </BaseCard>
  );
};

// Professional GoalsCard using BaseCard & Real Goals Data - Senior Product Code
const GoalsCard = () => {
  return (
    <GoalsProvider>
      <GoalsCardContent />
    </GoalsProvider>
  );
};

export default GoalsCard;

