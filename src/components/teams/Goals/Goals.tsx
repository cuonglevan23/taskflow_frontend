"use client";

import React from "react";
import { BaseCard } from "@/components/ui";
import { DARK_THEME } from "@/constants/theme";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  status: "on-track" | "at-risk" | "off-track";
  dueDate?: Date;
}

interface GoalsProps {
  goals?: Goal[];
  hasGoals?: boolean;
  onCreateGoal?: () => void;
  onGoalClick?: (goal: Goal) => void;
}

const Goals = ({ 
  goals = [], 
  hasGoals = false,
  onCreateGoal,
  onGoalClick 
}: GoalsProps) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return '#10B981';
      case 'at-risk':
        return '#F59E0B';
      case 'off-track':
        return '#EF4444';
      default:
        return '#10B981';
    }
  };

  const getStatusText = (status: string) => {
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

  return (
    <BaseCard
      title="Goals"
      createAction={{
        icon: () => <span>+</span>,
        label: "Create goal",
        onClick: () => onCreateGoal?.()
      }}
    >
      <div className="space-y-4">
        {!hasGoals ? (
          <>
            {/* Empty State */}
            <p 
              className="text-sm"
              style={{ color: DARK_THEME.text.secondary }}
            >
              This team hasn't created any goals yet
            </p>
            <p 
              className="text-xs"
              style={{ color: DARK_THEME.text.secondary }}
            >
              Add a goal so the team can see what you hope to achieve.
            </p>

            {/* Progress indicator for empty state - More compact */}
            <div className="space-y-3 mt-4">
              <div 
                className="h-2 rounded-full"
                style={{ backgroundColor: '#374151' }}
              >
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: '#10B981',
                    width: '0%'
                  }}
                ></div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#10B981' }}
                ></span>
                <span style={{ color: DARK_THEME.text.secondary }}>
                  On track (0%)
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Goals List */}
            <div className="space-y-3">
              {goals.map((goal) => (
                <div 
                  key={goal.id}
                  className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ 
                    backgroundColor: DARK_THEME.background.secondary,
                    borderColor: DARK_THEME.border.default 
                  }}
                  onClick={() => onGoalClick?.(goal)}
                >
                  <div className="space-y-2">
                    <h4 
                      className="font-medium text-sm"
                      style={{ color: DARK_THEME.text.primary }}
                    >
                      {goal.title}
                    </h4>
                    
                    {goal.description && (
                      <p 
                        className="text-xs"
                        style={{ color: DARK_THEME.text.secondary }}
                      >
                        {goal.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div 
                        className="h-1.5 rounded-full"
                        style={{ backgroundColor: DARK_THEME.background.primary }}
                      >
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            backgroundColor: getStatusColor(goal.status),
                            width: `${goal.progress}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getStatusColor(goal.status) }}
                        ></span>
                        <span style={{ color: DARK_THEME.text.secondary }}>
                          {getStatusText(goal.status)} ({goal.progress}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            {goals.length > 0 && (
              <div className="pt-2 border-t" style={{ borderColor: DARK_THEME.border.default }}>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: DARK_THEME.text.secondary }}>
                    Overall Progress
                  </span>
                  <span style={{ color: DARK_THEME.text.secondary }}>
                    {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </BaseCard>
  );
};

export default Goals;