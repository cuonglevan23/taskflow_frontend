"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { GanttTask } from './TimelineGantt';

export interface TimelineSectionProps {
  section: {
    id: string;
    title: string;
    collapsed: boolean;
  };
  taskCount: number;
  onToggle: (sectionId: string) => void;
}

const TimelineSection: React.FC<TimelineSectionProps> = ({
  section,
  taskCount,
  onToggle
}) => {
  const { theme } = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(section.id);
  };

  return (
    <div 
      className="timeline-section-header flex items-center px-2 py-1 cursor-pointer transition-colors w-full h-8 box-border mb-1 font-medium text-xs border-b hover:bg-black/5"
      style={{
        backgroundColor: theme.background.secondary,
        color: theme.text.primary,
        borderBottomColor: theme.border.default
      }}
      onClick={handleClick}
    >
      <div
        className={`w-3 h-3 mr-1 transition-transform duration-200 flex items-center justify-center ${
          section.collapsed ? '-rotate-90' : 'rotate-0'
        }`}
        style={{ color: theme.text.secondary }}
      >
        <ChevronDown size={12} />
      </div>
      <span 
        className="overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: theme.text.primary }}
      >
        {section.title} ({taskCount})
      </span>
    </div>
  );
};

export default TimelineSection;