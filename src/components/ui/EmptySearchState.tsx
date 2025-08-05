"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { Search } from "lucide-react";

interface EmptySearchStateProps {
  searchQuery: string;
  onClearSearch: () => void;
  onAdvancedSearch?: () => void;
}

const EmptySearchState: React.FC<EmptySearchStateProps> = ({
  searchQuery,
  onClearSearch,
  onAdvancedSearch
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
      {/* Search Icon with Red Circle */}
      <div className="relative mb-6">
        <div 
          className="w-20 h-20 rounded-full border-4 flex items-center justify-center"
          style={{ 
            borderColor: '#EF4444',
            backgroundColor: 'transparent'
          }}
        >
          <Search 
            className="w-8 h-8" 
            style={{ color: theme.text.primary }}
          />
        </div>
        {/* Red circle accent */}
        <div 
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2"
          style={{ 
            backgroundColor: '#EF4444',
            borderColor: theme.background.primary
          }}
        />
      </div>

      {/* Main Message */}
      <h3 
        className="text-xl font-semibold mb-2 text-center"
        style={{ color: theme.text.primary }}
      >
        No items match your search
      </h3>

      {/* Subtitle */}
      <p 
        className="text-base mb-6 text-center max-w-md"
        style={{ color: theme.text.secondary }}
      >
        Try being less specific or use different keywords
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onAdvancedSearch && (
          <button
            onClick={onAdvancedSearch}
            className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-opacity-80"
            style={{
              backgroundColor: 'transparent',
              color: theme.text.secondary,
              border: `1px solid ${theme.border.default}`
            }}
          >
            Go to advanced search
          </button>
        )}
        
        <button
          onClick={onClearSearch}
          className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-opacity-90"
          style={{
            backgroundColor: theme.colors?.primary || '#3B82F6',
            color: 'white'
          }}
        >
          Clear search
        </button>
      </div>

      {/* Search Query Display */}
      {searchQuery && (
        <div className="mt-4 text-sm opacity-75" style={{ color: theme.text.secondary }}>
          Searched for: "<span className="font-medium">{searchQuery}</span>"
        </div>
      )}
    </div>
  );
};

export default EmptySearchState;