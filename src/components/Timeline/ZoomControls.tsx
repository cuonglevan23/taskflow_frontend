"use client";

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

export type ZoomLevel = 'compact' | 'normal' | 'comfortable' | 'spacious';

interface ZoomControlsProps {
  currentZoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  className?: string;
}

const ZOOM_LEVELS: { [key in ZoomLevel]: { label: string; slotWidth: number } } = {
  compact: { label: 'Compact', slotWidth: 60 },
  normal: { label: 'Normal', slotWidth: 80 },
  comfortable: { label: 'Comfortable', slotWidth: 120 },
  spacious: { label: 'Spacious', slotWidth: 160 }
};

const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentZoom,
  onZoomChange,
  className = ''
}) => {
  const { theme } = useTheme();

  const zoomLevels = Object.keys(ZOOM_LEVELS) as ZoomLevel[];
  const currentIndex = zoomLevels.indexOf(currentZoom);

  const handleZoomIn = () => {
    const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
    onZoomChange(zoomLevels[nextIndex]);
  };

  const handleZoomOut = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    onZoomChange(zoomLevels[prevIndex]);
  };

  const handleFitToScreen = () => {
    onZoomChange('normal');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        disabled={currentIndex === 0}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ 
          color: theme.text.secondary,
          backgroundColor: 'transparent'
        }}
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Current Zoom Level */}
      <div className="flex items-center gap-2 px-3 py-1 rounded border min-w-[100px]" 
           style={{ 
             borderColor: theme.border.default,
             backgroundColor: theme.background.primary,
             color: theme.text.primary
           }}>
        <span className="text-sm font-medium">
          {ZOOM_LEVELS[currentZoom].label}
        </span>
        <span className="text-xs opacity-60">
          {ZOOM_LEVELS[currentZoom].slotWidth}px
        </span>
      </div>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        disabled={currentIndex === zoomLevels.length - 1}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ 
          color: theme.text.secondary,
          backgroundColor: 'transparent'
        }}
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Fit to Screen */}
      <button
        onClick={handleFitToScreen}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        style={{ 
          color: theme.text.secondary,
          backgroundColor: 'transparent'
        }}
        title="Fit to Screen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ZoomControls;
export { ZOOM_LEVELS };