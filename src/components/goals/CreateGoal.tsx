import React from 'react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface CreateGoalProps {
  onCreateClick: () => void;
}

export default function CreateGoal({ onCreateClick }: CreateGoalProps) {
  const { theme } = useTheme();

  return (
    <div
      className="relative rounded-lg p-5 mb-4 border border-dashed flex items-center justify-center transition-all hover:border-solid cursor-pointer"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
        minHeight: '120px'
      }}
      onClick={onCreateClick}
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <span 
            className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
            style={{ 
              backgroundColor: theme.background.secondary,
              color: theme.text.primary
            }}
          >
            +
          </span>
        </div>
        <p style={{ color: theme.text.primary }}>Create new goal</p>
      </div>
    </div>
  );
};
