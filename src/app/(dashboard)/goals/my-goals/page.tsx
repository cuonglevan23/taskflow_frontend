// app/goals/MyGoalsPage.tsx
"use client";

import React from "react";
import { GoalsProvider, useGoals } from "@/contexts/GoalsContext";
import { CreateGoalButton } from "@/components/goals/GoalNavigation";
import { GoalTable } from "@/components/goals/GoalTable";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

function MyGoalsContent() {
  const { filteredGoals, toggleGoalExpanded, loading, error } = useGoals();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

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
          <h1
            className="text-xl font-semibold"
            style={{ color: theme.text.primary }}
          >
            {messages?.navigation?.goals?.myGoals || "My Goals"}
          </h1>


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
                  {messages?.common?.loading || "Loading goals..."}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div 
                className="text-xl"
                style={{ color: theme.status.error }}
              >
                {messages?.common?.error || "Error loading goals"}: {error}
              </div>
            </div>
          ) : filteredGoals.length > 0 ? (
            <GoalTable goals={filteredGoals} onToggleExpand={toggleGoalExpanded} />
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h2
                className="text-2xl font-semibold mb-2"
                style={{ color: theme.text.primary }}
              >
                {messages?.cards?.goals?.noGoals || "No goals yet"}
              </h2>
              <p
                className="text-lg mb-4"
                style={{ color: theme.text.primary }}
              >
                {messages?.cards?.goals?.createGoal || "Create your first goal to track your progress"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyGoalsPage() {
  return (
    <GoalsProvider>
      <MyGoalsContent />
    </GoalsProvider>
  );
}
