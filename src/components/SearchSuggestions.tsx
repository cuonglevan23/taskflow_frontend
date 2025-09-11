'use client';

import React from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSuggestionsProps {
  suggestions: string[];
  onSuggestionSelect: (suggestion: string) => void;
  currentQuery: string;
  maxSuggestions?: number;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSuggestionSelect,
  currentQuery,
  maxSuggestions = 8
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  const displaySuggestions = suggestions.slice(0, maxSuggestions);

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-2">
        <div className="flex items-center text-xs text-gray-500 mb-2 px-2">
          <TrendingUp className="h-3 w-3 mr-1" />
          Suggestions
        </div>

        <div className="space-y-0.5">
          {displaySuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionSelect(suggestion)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-md",
                "hover:bg-gray-50 transition-colors",
                "flex items-center"
              )}
            >
              <Search className="h-3 w-3 mr-2 text-gray-400" />
              <span className="flex-1">
                <HighlightMatch text={suggestion} query={currentQuery} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component to highlight matching parts in suggestions
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="font-medium text-gray-900">
            {part}
          </span>
        ) : (
          <span key={index} className="text-gray-600">
            {part}
          </span>
        )
      )}
    </>
  );
};

export default SearchSuggestions;
