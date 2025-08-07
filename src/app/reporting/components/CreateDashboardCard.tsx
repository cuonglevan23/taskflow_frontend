"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { Plus } from "lucide-react";

// Create Dashboard Card Props - type-safe and flexible
export interface CreateDashboardCardProps {
  viewMode?: 'tiles' | 'list';
  onClick?: () => void;
  className?: string;
  label?: string;
  description?: string;
}

// Create Dashboard Card Component - Reusable & Professional
const CreateDashboardCard: React.FC<CreateDashboardCardProps> = ({
  viewMode = 'tiles',
  onClick,
  className = '',
  label = 'Create dashboard',
  description,
}) => {
  const { theme } = useTheme();

  const handleClick = () => {
    onClick?.();
  };

  // List View Layout
  if (viewMode === 'list') {
    return (
      <div
        className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer hover:shadow-md flex items-center gap-4 ${className}`}
        style={{
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
        }}
        onClick={handleClick}
      >
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <Plus 
            className="w-5 h-5"
            style={{ color: theme.text.secondary }}
          />
        </div>
        
        <div className="flex-1">
          <span 
            className="text-base font-medium"
            style={{ color: theme.text.secondary }}
          >
            {label}
          </span>
          {description && (
            <p 
              className="text-sm mt-1"
              style={{ color: theme.text.secondary }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Tiles View Layout (Default)
  return (
    <div
      className={`p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 flex flex-col items-center justify-center min-h-[200px] ${className}`}
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
      }}
      onClick={handleClick}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: theme.background.secondary }}
      >
        <Plus 
          className="w-6 h-6"
          style={{ color: theme.text.secondary }}
        />
      </div>
      
      <span 
        className="text-lg font-medium text-center"
        style={{ color: theme.text.secondary }}
      >
        {label}
      </span>
      
      {description && (
        <p 
          className="text-sm text-center mt-2"
          style={{ color: theme.text.secondary }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default CreateDashboardCard;