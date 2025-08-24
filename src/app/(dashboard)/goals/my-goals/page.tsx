// app/goals/MyGoalsPage.tsx
"use client";

import React from "react";
import { GoalsProvider, useGoals } from "@/contexts/GoalsContext";
import { CreateGoalButton } from "@/components/goals/GoalNavigation";
import { GoalTable } from "@/components/goals/GoalTable";
import { DARK_THEME } from "@/constants/theme";

function MyGoalsContent() {
  const { filteredGoals, toggleGoalExpanded, loading, error } = useGoals();
  
  return (
    <div
      className="flex-1 min-h-0 flex flex-col"
      style={{ backgroundColor: DARK_THEME.background.secondary }}
    >
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{
          backgroundColor: DARK_THEME.background.primary,
          borderColor: DARK_THEME.border?.default || "#424244",
        }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4 border-b border-gray-700 sticky top-0 z-30"
          style={{ backgroundColor: DARK_THEME.background.primary }}
        >
          <h1
            className="text-xl font-semibold"
            style={{ color: DARK_THEME.text.primary }}
          >
            My Goals
          </h1>

          <div className="flex items-center gap-2 flex-shrink-0">
            <CreateGoalButton onClick={() => alert("Create goal here")} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center">
                <div className="animate-pulse flex space-x-4 mb-4">
                  <div className="rounded-full bg-slate-700 h-12 w-12"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-slate-700 rounded w-40"></div>
                    <div className="h-4 bg-slate-700 rounded w-24"></div>
                  </div>
                </div>
                <div 
                  className="text-xl mt-2"
                  style={{ color: DARK_THEME.text.secondary }}
                >
                  Loading goals...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div 
                className="text-xl text-red-500"
                style={{ color: "#ef4444" }}
              >
                Error loading goals: {error}
              </div>
            </div>
          ) : filteredGoals.length > 0 ? (
            <GoalTable goals={filteredGoals} onToggleExpand={toggleGoalExpanded} />
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h2
                className="text-2xl font-semibold mb-2"
                style={{ color: DARK_THEME.text.primary }}
              >
                No goals yet
              </h2>
              <p
                className="text-lg mb-4"
                style={{ color: DARK_THEME.text.primary }}
              >
                Create your first goal to track your progress
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
