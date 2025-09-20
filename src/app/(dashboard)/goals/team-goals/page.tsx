"use client";

import React, { useState } from "react";
import { useTeamGoals } from "@/hooks/process/useTeamGoals";
import { useTeamProgress } from "@/hooks/process/useTeamProgress";
import { GoalTable } from "@/components/goals/GoalTable";
import { TeamProgressCard } from "@/components/teams/TeamProgressCard";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { LayoutGrid, List } from "lucide-react";

function TeamGoalsContent() {
  const { goals, toggleGoalExpanded, loading: goalsLoading, error: goalsError } = useTeamGoals();
  const { teamsProgress, loading: progressLoading, error: progressError } = useTeamProgress();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const loading = goalsLoading || progressLoading;
  const error = goalsError || progressError;

  const getProgressStats = () => {
    if (teamsProgress.length === 0) return { avgProgress: 0, totalTasks: 0, completedTasks: 0 };
    
    const totalTasks = teamsProgress.reduce((sum, team) => sum + team.totalTasks, 0);
    const completedTasks = teamsProgress.reduce((sum, team) => sum + team.completedTasks, 0);
    const avgProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return { avgProgress, totalTasks, completedTasks };
  };

  const stats = getProgressStats();
  
  return (
    <div
      className="flex-1 min-h-0 flex flex-col"
      style={{ backgroundColor: theme.background.secondary }}
    >
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{
          backgroundColor: theme.background.primary,
          borderColor: theme.border?.default || "#424244",
        }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4 border-b border-gray-700 sticky top-0 z-30"
          style={{ backgroundColor: theme.background.primary }}
        >
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: theme.text.primary }}
            >
              {messages?.navigation?.goals?.teamGoals || "Team Goals"}
            </h1>
            {teamsProgress.length > 0 && (
              <p
                className="text-sm mt-1"
                style={{ color: theme.text.secondary }}
              >
                {teamsProgress.length} {teamsProgress.length === 1 ? (messages?.common?.team || 'team') : (messages?.common?.teams || 'teams')} • {Math.round(stats.avgProgress)}% {messages?.common?.averageProgress || 'average progress'} • {stats.completedTasks}/{stats.totalTasks} {messages?.common?.tasksCompleted || 'tasks completed'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border" style={{ borderColor: theme.border?.default }}>
              <button
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'cards' 
                    ? 'text-white' 
                    : ''
                }`}
                style={{ 
                  backgroundColor: viewMode === 'cards' ? theme.status.info : 'transparent',
                  color: viewMode === 'cards' ? theme.text.inverse : theme.text.secondary
                }}
                onClick={() => setViewMode('cards')}
                title={messages?.common?.cardView || "Card view"}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'text-white' 
                    : ''
                }`}
                style={{ 
                  backgroundColor: viewMode === 'table' ? theme.status.info : 'transparent',
                  color: viewMode === 'table' ? theme.text.inverse : theme.text.secondary
                }}
                onClick={() => setViewMode('table')}
                title={messages?.common?.tableView || "Table view"}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center">
                <div className="animate-pulse flex space-x-4 mb-4">
                  <div
                    className="rounded-full h-12 w-12"
                    style={{ backgroundColor: theme.background.muted }}
                  ></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div
                      className="h-4 rounded w-40"
                      style={{ backgroundColor: theme.background.muted }}
                    ></div>
                    <div
                      className="h-4 rounded w-24"
                      style={{ backgroundColor: theme.background.muted }}
                    ></div>
                  </div>
                </div>
                <div 
                  className="text-xl mt-2"
                  style={{ color: theme.text.secondary }}
                >
                  {messages?.common?.loadingTeamProgress || "Loading team progress..."}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div 
                className="text-xl"
                style={{ color: theme.status.error }}
              >
                {messages?.common?.errorLoadingTeamProgress || "Error loading team progress"}: {error}
              </div>
            </div>
          ) : teamsProgress.length > 0 ? (
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamsProgress.map((team) => (
                  <TeamProgressCard
                    key={team.teamId}
                    teamProgress={team}
                    onClick={() => {
                      // TODO: Navigate to team detail page
                      console.log('Navigate to team:', team.teamId);
                    }}
                  />
                ))}
              </div>
            ) : (
              <GoalTable goals={goals} onToggleExpand={toggleGoalExpanded} />
            )
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h2
                className="text-2xl font-semibold mb-2"
                style={{ color: theme.text.primary }}
              >
                {messages?.common?.noTeamProgress || "No team progress found"}
              </h2>
              <p
                className="text-lg mb-4"
                style={{ color: theme.text.primary }}
              >
                {messages?.common?.notTeamMember || "You are not a member of any team with active tasks"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeamGoalsPage() {
  return <TeamGoalsContent />;
}
