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
      className="timeline-section-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        background: theme.background.secondary,
        color: theme.text.primary,
        fontWeight: 500,
        fontSize: '0.75rem',
        fontFamily: 'inherit',
        width: '100%',
        border: 'none',
        height: '50px',
        boxSizing: 'border-box' as const,
        borderBottom: `1px solid ${theme.border.default}`
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.background.secondary;
      }}
    >
      <div
        style={{
          width: '14px',
          height: '14px',
          marginRight: '6px',
          transition: 'transform 0.2s',
          color: theme.text.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: section.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
        }}
      >
        <ChevronDown size={14} />
      </div>
      <span style={{ color: theme.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {section.title} ({taskCount})
      </span>
    </div>
  );
};

export default TimelineSection;