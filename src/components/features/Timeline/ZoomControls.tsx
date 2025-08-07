"use client";

import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

export type ViewMode = 'resourceTimelineDay' | 'resourceTimelineWeek' | 'resourceTimelineMonth' | 'resourceTimelineQuarter' | 'resourceTimelineHalfYear';

interface ZoomControlsProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

const VIEW_MODES: { [key in ViewMode]: { label: string; shortLabel: string; slotWidth: number } } = {
  resourceTimelineHalfYear: { label: 'Half Year View', shortLabel: 'Half Year', slotWidth: 20 },
  resourceTimelineQuarter: { label: 'Quarter View', shortLabel: 'Quarter', slotWidth: 30 },
  resourceTimelineMonth: { label: 'Month View', shortLabel: 'Month', slotWidth: 40 },
  resourceTimelineWeek: { label: 'Week View', shortLabel: 'Week', slotWidth: 80 },
  resourceTimelineDay: { label: 'Day View', shortLabel: 'Day', slotWidth: 120 }
};

const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentView,
  onViewChange,
  className = ''
}) => {
  const { theme } = useTheme();

  const viewModes = Object.keys(VIEW_MODES) as ViewMode[];
  const currentIndex = viewModes.indexOf(currentView);

  const handleZoomIn = () => {
    // Zoom in = more detailed view: Month -> Week -> Day
    const nextIndex = Math.min(currentIndex + 1, viewModes.length - 1);
    onViewChange(viewModes[nextIndex]);
  };

  const handleZoomOut = () => {
    // Zoom out = less detailed view: Day -> Week -> Month  
    const prevIndex = Math.max(currentIndex - 1, 0);
    onViewChange(viewModes[prevIndex]);
  };

  const isHeaderMode = className?.includes('text-white');

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Zoom Out (to broader view) */}
      <button
        onClick={handleZoomOut}
        disabled={currentIndex === 0}
        className={`p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isHeaderMode 
            ? 'hover:bg-gray-800 text-white' 
            : 'hover:bg-gray-100'
        }`}
        style={{ 
          color: isHeaderMode ? 'white' : theme.text.secondary,
          backgroundColor: 'transparent'
        }}
        title="Zoom Out (Broader View)"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Current View Mode */}
      <div 
        className={`flex items-center px-2 py-1 rounded border min-w-[70px] ${
          isHeaderMode ? 'border-gray-600 bg-gray-800' : ''
        }`}
        style={{ 
          borderColor: isHeaderMode ? '#4b5563' : theme.border.default,
          backgroundColor: isHeaderMode ? '#1f2937' : theme.background.primary,
          color: isHeaderMode ? 'white' : theme.text.primary
        }}
      >
        <span className="text-sm font-medium">
          {VIEW_MODES[currentView].shortLabel}
        </span>
      </div>

      {/* Zoom In (to detailed view) */}
      <button
        onClick={handleZoomIn}
        disabled={currentIndex === viewModes.length - 1}
        className={`p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          isHeaderMode 
            ? 'hover:bg-gray-800 text-white' 
            : 'hover:bg-gray-100'
        }`}
        style={{ 
          color: isHeaderMode ? 'white' : theme.text.secondary,
          backgroundColor: 'transparent'
        }}
        title="Zoom In (Detailed View)"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ZoomControls;
export { VIEW_MODES };