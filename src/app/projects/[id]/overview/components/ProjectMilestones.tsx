"use client";

import { ACTION_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';

export function ProjectMilestones() {
  const { theme } = useTheme();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: theme.text.secondary }}>
        <span>Milestones</span>
        <ACTION_ICONS.create 
          size={14} 
          className="cursor-pointer transition-colors"
          style={{ color: theme.text.muted }}
          onMouseEnter={(e) => e.currentTarget.style.color = theme.text.secondary}
          onMouseLeave={(e) => e.currentTarget.style.color = theme.text.muted}
        />
      </div>
      
      <div className="border-t border-gray-200 pt-3">
        <button className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
          <div className="w-4 h-4 flex items-center justify-center">
            🏛️
          </div>
          <span>Add milestone...</span>
        </button>
      </div>
      
      {/* Example milestone items */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm" style={{ color: theme.text.primary }}>Project kickoff completed</span>
          <span className="text-xs ml-auto" style={{ color: theme.text.muted }}>✓</span>
        </div>
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm" style={{ color: theme.text.primary }}>Requirements gathering</span>
          <span className="text-xs ml-auto" style={{ color: theme.text.muted }}>In progress</span>
        </div>
      </div>
    </div>
  );
}