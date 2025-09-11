'use client';

import React from 'react';
import { Clock, Search, X, Trash2 } from 'lucide-react';
import { SearchHistory as SearchHistoryType } from '@/types/search';
import { cn } from '@/lib/utils';

interface SearchHistoryProps {
  history: SearchHistoryType[];
  onHistorySelect: (historyItem: SearchHistoryType) => void;
  onClearHistory: () => void;
  onRemoveItem?: (historyId: string) => void; // New prop for individual removal
  maxItems?: number;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onHistorySelect,
  onClearHistory,
  onRemoveItem,
  maxItems = 10
}) => {
  if (history.length === 0) {
    return null;
  }

  const displayHistory = history.slice(0, maxItems);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  const getEntityIcons = (entities: string[]) => {
    const iconMap = {
      tasks: '✓',
      projects: '📁',
      users: '👤',
      teams: '👥'
    };

    return entities.map(entity => iconMap[entity as keyof typeof iconMap] || '?').join(' ');
  };

  const handleRemoveItem = (e: React.MouseEvent, historyId: string) => {
    e.stopPropagation();
    onRemoveItem?.(historyId);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Recent searches
          </div>
          <button
            onClick={onClearHistory}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center"
            title="Clear search history"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* History Items */}
        <div className="space-y-0.5">
          {displayHistory.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-center justify-between px-3 py-2 text-sm rounded-md",
                "hover:bg-gray-50 transition-colors cursor-pointer"
              )}
              onClick={() => onHistorySelect(item)}
            >
              <div className="flex items-center flex-1 min-w-0">
                <Search className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {item.query}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <span className="mr-2">{getEntityIcons(item.entities)}</span>
                    <span className="mr-2">{item.resultCount} results</span>
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Remove individual item button */}
              {onRemoveItem && (
                <button
                  onClick={(e) => handleRemoveItem(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                  title="Remove from history"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Show more if there are more items */}
        {history.length > maxItems && (
          <div className="text-center mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              +{history.length - maxItems} more searches
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistory;
