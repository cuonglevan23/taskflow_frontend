"use client";

import React from "react";
import { Button } from "@/components/ui";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

export interface MembersHeaderProps {
  onAddMember: () => void;
  onSendFeedback?: () => void;
  onSearch?: () => void;
}

export default function MembersHeader({ 
  onAddMember, 
  onSendFeedback,
  onSearch 
}: MembersHeaderProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <div
      className="flex items-center justify-between p-6"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* Left side - Add Member Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddMember}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors"
          style={{
            backgroundColor: theme.background.secondary,
            color: theme.text.primary,
            borderColor: theme.border.default,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.weakHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
        >
          <span className="text-sm">+</span>
          <span>{t('navigation.teams.members.actions.addMember')}</span>
        </Button>
      </div>
    </div>
  );
}