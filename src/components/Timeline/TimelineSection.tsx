"use client";

import React from 'react';
import { ChevronDown, ChevronRight, Flag } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';
import { TimelineTask } from './Timeline';

export interface TimelineSectionProps {
  section: {
    id: string;
    title: string;
    collapsed: boolean;
  };
  tasks: TimelineTask[];
  dateColumns: Date[];
  timelineRange: { start: Date; end: Date };
  onSectionToggle: (sectionId: string) => void;
  onTaskClick?: (task: TimelineTask) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getTaskPosition: (task: TimelineTask) => {
    left: string;
    width: string;
    isPartial: boolean;
  };
}

const TimelineSection: React.FC<TimelineSectionProps> = ({
  section,
  tasks,
  dateColumns,
  timelineRange,
  onSectionToggle,
  onTaskClick,
  getPriorityColor,
  getStatusColor,
  getTaskPosition
}) => {
  const { theme } = useTheme();

  return (
    <div>
      {/* Section Header */}
      <div 
        className="section-header flex border-b py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
        style={{ 
          borderColor: theme.border.default, 
          backgroundColor: theme.background.secondary,
          minHeight: '56px'
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSectionToggle(section.id);
        }}
        title={section.collapsed ? `Expand ${section.title}` : `Collapse ${section.title}`}
      >
        <div className="w-64 flex items-center gap-2">
          <div
            className="p-1 hover:bg-gray-200 rounded transition-colors flex items-center justify-center"
            style={{ 
              color: theme.text.secondary,
              minWidth: '24px',
              minHeight: '24px'
            }}
          >
            {section.collapsed ? (
              <ChevronRight 
                className="w-4 h-4 transition-transform duration-200"
                style={{ color: theme.text.secondary }}
              />
            ) : (
              <ChevronDown 
                className="w-4 h-4 transition-transform duration-200"
                style={{ color: theme.text.secondary }}
              />
            )}
          </div>
          <span 
            className="font-medium text-base select-none" 
            style={{ color: theme.text.primary }}
          >
            {section.title} ({tasks.length})
          </span>
        </div>
        <div className="flex-1"></div>
      </div>

      {/* Section Tasks - Only show when not collapsed */}
      {!section.collapsed && tasks.length > 0 && tasks.map((task, index) => {
        const position = getTaskPosition(task);
        
        return (
          <div
            key={task.id}
            className="timeline-row flex border-b hover:bg-gray-50 transition-colors"
            style={{ 
              borderColor: theme.border.default,
              minHeight: '45px'
            }}
          >
            {/* Task Info */}
            <div className="w-64 p-2 border-r" style={{ borderColor: theme.border.default }}>
              <div className="flex items-start gap-2 pl-6">
                {task.milestone && <Flag className="w-3 h-3 text-orange-500 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-medium text-sm truncate cursor-pointer hover:text-blue-600"
                    style={{ color: theme.text.primary }}
                    onClick={() => onTaskClick?.(task)}
                  >
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex -space-x-1">
                      {task.assignees.slice(0, 3).map((assignee) => (
                        <div
                          key={assignee.id}
                          className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
                          title={assignee.name}
                        >
                          {assignee.avatar || assignee.name.charAt(0)}
                        </div>
                      ))}
                      {task.assignees.length > 3 && (
                        <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border-2 border-white">
                          +{task.assignees.length - 3}
                        </div>
                      )}
                    </div>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                      title={task.status}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="flex-1 relative p-2">
              <div
                className="absolute top-1/2 h-4 rounded transform -translate-y-1/2 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  left: position.left,
                  width: position.width,
                  backgroundColor: getPriorityColor(task.priority),
                  opacity: task.status === 'done' ? 0.6 : 1,
                }}
                onClick={() => onTaskClick?.(task)}
              >
                {/* Progress Bar */}
                <div
                  className="h-full bg-white bg-opacity-30 rounded"
                  style={{ width: `${task.progress}%` }}
                />
                
                {/* Task Label */}
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-white text-xs font-medium truncate">
                    {task.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineSection;