"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  size = 'md',
}) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.max(0, Math.min(100, progress));
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div 
      className={cn(
        "bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700",
        sizeClasses[size],
        className
      )}
    >
      <div 
        className="bg-blue-600 h-full rounded-full" 
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
};
