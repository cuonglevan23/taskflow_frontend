"use client";

import React from 'react';
import { ImageAssets } from '@/utils/imageAssets';

interface EmptySearchStateProps {
  title?: string;
  description?: string;
  searchQuery?: string;
  onReset?: () => void;
  className?: string;
  showResetButton?: boolean;
  icon?: React.ReactNode;
}

const EmptySearchState = ({
  title = "No results found",
  description,
  searchQuery,
  onReset,
  className = "",
  showResetButton = true,
  icon
}: EmptySearchStateProps) => {
  const defaultDescription = searchQuery 
    ? `No results found for "${searchQuery}". Try adjusting your search terms.`
    : "Try changing your search criteria or filters.";

  const finalDescription = description || defaultDescription;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Icon or illustration */}
      <div className="mb-6">
        {icon ? (
          <div className="text-6xl text-gray-400 dark:text-gray-600">
            {icon}
          </div>
        ) : (
          <img 
            src={ImageAssets.placeholders.emptyState.search}
            alt="No search results"
            className="w-32 h-32 opacity-60"
            onError={(e) => {
              // Fallback to emoji if SVG fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        )}
        {/* Fallback emoji */}
        <div className="text-6xl text-gray-400 dark:text-gray-600 hidden">
          🔍
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {finalDescription}
      </p>

      {/* Search query display */}
      {searchQuery && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 mb-4 max-w-xs">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Searched for: <strong>"{searchQuery}"</strong>
          </span>
        </div>
      )}

      {/* Reset/Clear button */}
      {showResetButton && onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
          Clear search
        </button>
      )}

      {/* Suggestions */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-2">Try:</p>
        <ul className="space-y-1">
          <li>• Using different keywords</li>
          <li>• Checking your spelling</li>
          <li>• Using fewer words</li>
          <li>• Clearing filters</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptySearchState;