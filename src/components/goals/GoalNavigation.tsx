"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "lucide-react";
import { GoalTab } from "@/types/goals";
import { cn } from "@/lib/utils";
import { DARK_THEME } from "@/constants/theme";

interface GoalTabsProps {
  activeTab: GoalTab;
  onTabChange: (tab: GoalTab) => void;
}

export function GoalTabs({ activeTab, onTabChange }: GoalTabsProps) {
  const tabs: { id: GoalTab; label: string }[] = [
    { id: 'strategy-map', label: 'Strategy map' },
    { id: 'team-goals', label: 'Team goals' },
    { id: 'my-goals', label: 'My goals' }
  ];

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4"
         style={{ borderColor: DARK_THEME.border.default }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium",
            activeTab === tab.id
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
          )}
          style={{ 
            color: activeTab === tab.id ? DARK_THEME.text.primary : DARK_THEME.text.secondary,
            borderColor: activeTab === tab.id ? DARK_THEME.border.default : 'transparent'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface CreateGoalButtonProps {
  onClick: () => void;
}

export function CreateGoalButton({ onClick }: CreateGoalButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      size="sm"
      className="flex items-center gap-1"
      style={{ backgroundColor: DARK_THEME.button.primary, color: DARK_THEME.text.inverse }}
    >
      <PlusIcon size={16} />
      <span>Create goal</span>
    </Button>
  );
}
