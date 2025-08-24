import React from 'react';
import { DARK_THEME } from '@/constants/theme';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'auto';
}

export function ProgressBar({
  percentage,
  label,
  showPercentage = true,
  size = 'md',
  color = 'blue'
}: ProgressBarProps) {
  // Đảm bảo giá trị phần trăm nằm trong khoảng 0-100
  const safePercentage = Math.max(0, Math.min(100, percentage || 0));
  
  // Chọn màu dựa theo giá trị phần trăm
  const getColorByPercentage = () => {
    if (color !== 'auto') return color;
    
    if (safePercentage >= 75) return 'green';
    if (safePercentage >= 50) return 'blue';
    if (safePercentage >= 25) return 'yellow';
    return 'red';
  };
  
  const autoColor = getColorByPercentage();
  
  // Xác định chiều cao dựa vào kích thước
  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-1.5';
      case 'lg': return 'h-4';
      default: return 'h-2.5';
    }
  };

  // Lấy màu fill cho progress bar
  const getProgressColor = () => {
    switch (autoColor) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm" style={{ color: DARK_THEME.text.secondary }}>{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium" style={{ color: DARK_THEME.text.primary }}>
              {safePercentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div 
        className={cn("w-full rounded-full overflow-hidden", getHeight())} 
        style={{ backgroundColor: DARK_THEME.background.muted }}
      >
        <div
          className={cn(getProgressColor(), "rounded-full transition-all duration-300")}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressCard({
  title,
  value,
  max,
  percentage,
  icon,
  children
}: {
  title: string;
  value: number;
  max: number;
  percentage: number;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div 
      className="p-4 rounded-lg"
      style={{ 
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default,
        border: `1px solid ${DARK_THEME.border.default}`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ color: DARK_THEME.text.primary }} className="text-base font-medium">
          {title}
        </h3>
        {icon && <div>{icon}</div>}
      </div>
      
      <div className="mb-4">
        <ProgressBar 
          percentage={percentage} 
          label={`${value}/${max} tasks completed`} 
          color="auto"
        />
      </div>
      
      {children}
    </div>
  );
}
