"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "lucide-react";
import { GoalTab } from "@/types/goals";
import { cn } from "@/lib/utils";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface GoalTabsProps {
  activeTab: GoalTab;
  onTabChange: (tab: GoalTab) => void;
}

export function GoalTabs({ activeTab, onTabChange }: GoalTabsProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const tabs: { id: GoalTab; label: string }[] = [
    { id: 'strategy-map', label: 'Strategy map' },
    { id: 'team-goals', label: 'Team goals' },
    { id: 'my-goals', label: 'My goals' }
  ];

  return (
    <div className="flex border-b mb-4"
         style={{ borderColor: theme.border.default }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="px-4 py-2 text-sm font-medium transition-colors border-b-2"
          style={{
            color: activeTab === tab.id ? theme.text.primary : theme.text.secondary,
            borderBottomColor: activeTab === tab.id ? (theme.status?.info || '#3b82f6') : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = theme.text.primary;
              e.currentTarget.style.borderBottomColor = theme.border.muted;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = theme.text.secondary;
              e.currentTarget.style.borderBottomColor = 'transparent';
            }
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
  const { theme } = useThemeContext();

  return (
    <Button 
      onClick={onClick} 
      size="sm"
      className="flex items-center gap-1"
      style={{
        backgroundColor: theme.button.primary.background,
        color: theme.button.primary.text
      }}
    >
      <PlusIcon size={16} />
      <span>Create goal</span>
    </Button>
  );
}
