"use client";

import React from "react";
import { GoalListItem, GoalStatus } from "@/types/goals";
import { ChevronDown, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { DARK_THEME } from "@/constants/theme";

interface GoalTableProps {
  goals: GoalListItem[];
  onToggleExpand: (id: string) => void;
}

export function GoalTable({ goals, onToggleExpand }: GoalTableProps) {
  return (
    <div className="overflow-hidden rounded-lg"
         style={{ 
           backgroundColor: DARK_THEME.background.primary,
           borderColor: DARK_THEME.border.default,
           border: `1px solid ${DARK_THEME.border.default}`
         }}>
      <table className="min-w-full"
             style={{ 
               backgroundColor: DARK_THEME.background.primary,
               color: DARK_THEME.text.primary,
               borderColor: DARK_THEME.border.default
             }}>
        <thead style={{ 
                backgroundColor: DARK_THEME.background.secondary,
                borderBottom: `1px solid ${DARK_THEME.border.default}`
              }}>
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: DARK_THEME.text.secondary }}>
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: DARK_THEME.text.secondary }}>
              Time period
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: DARK_THEME.text.secondary }}>
              Progress
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: DARK_THEME.text.secondary }}>
              Owner
            </th>
          </tr>
        </thead>
        <tbody style={{ 
                backgroundColor: DARK_THEME.background.primary,
                borderColor: DARK_THEME.border.default
              }}>
          {goals.map((goal) => (
            <tr 
              key={goal.id}
              className="cursor-pointer"
              style={{ 
                borderBottom: `1px solid ${DARK_THEME.border.default}`,
                transition: 'background-color 0.2s'
              }}
              onClick={() => onToggleExpand(goal.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = DARK_THEME.background.primary;
              }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {goal.isExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-2" 
                               style={{ color: DARK_THEME.text.secondary }} />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" 
                                style={{ color: DARK_THEME.text.secondary }} />
                  )}
                  <div className="text-sm font-medium"
                       style={{ color: DARK_THEME.text.primary }}>{goal.name}</div>
                  {goal.workspaceName && (
                    <span className="ml-2 text-xs"
                          style={{ color: DARK_THEME.text.secondary }}>
                      {goal.workspaceName}
                    </span>
                  )}
                  {goal.teamName && (
                    <span className="ml-2 text-xs"
                          style={{ color: DARK_THEME.text.secondary }}>
                      {goal.teamName}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm"
                      style={{ color: DARK_THEME.text.secondary }}>{goal.timePeriod}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {renderStatusIndicator(goal)}
                  <div className="ml-2 w-24 rounded-full h-2"
                       style={{ backgroundColor: DARK_THEME.background.muted }}>
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        getProgressColorClass(goal.status)
                      )}
                      style={{ width: `${goal.progress}%` }} 
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
                       style={{ backgroundColor: DARK_THEME.background.muted }}>
                    {goal.ownerAvatarUrl ? (
                      <Image 
                        src={goal.ownerAvatarUrl} 
                        alt={`Owner of ${goal.name}`}
                        className="h-8 w-8 rounded-full" 
                        width={32}
                        height={32}
                      />
                    ) : (
                      "CZ"
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to render status indicators
function renderStatusIndicator(goal: GoalListItem) {
  if (goal.status === 'on track') {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                 style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>On track</span>;
  }
  
  if (goal.status === 'at risk') {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                 style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>At risk</span>;
  }
  
  if (goal.status === 'off track') {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                 style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Off track</span>;
  }

  if (goal.hasRisk) {
    return <Zap size={16} className="text-yellow-500" />;
  }
  
  return <span className="text-sm" style={{ color: DARK_THEME.text.muted }}>No status</span>;
}

// Helper function to get progress bar color based on status
function getProgressColorClass(status: GoalStatus): string {
  switch (status) {
    case 'on track':
      return 'bg-green-500';
    case 'at risk':
      return 'bg-yellow-500';
    case 'off track':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
  }
}
