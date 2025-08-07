"use client";

import { FILE_ICONS, ACTION_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';

export function KeyResources() {
  const { theme } = useTheme();
  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm" style={{ color: theme.text.secondary }}>Key resources</div>
      
      <div 
        className="border border-dashed rounded-lg p-6 text-center space-y-4"
        style={{ 
          borderColor: theme.border.default,
          backgroundColor: theme.background.secondary
        }}
      >
        <div className="text-sm" style={{ color: theme.text.secondary }}>
          Align your team around a shared vision with a project brief and supporting resources.
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{ color: '#3b82f6' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1d4ed8';
              e.currentTarget.style.backgroundColor = theme.background.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FILE_ICONS.document size={16} />
            Create project brief
          </button>
          
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{ color: '#3b82f6' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1d4ed8';
              e.currentTarget.style.backgroundColor = theme.background.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ACTION_ICONS.attach size={16} />
            Add links & files
          </button>
        </div>
      </div>
    </div>
  );
}