"use client";

import { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X, Archive } from 'lucide-react';
import { Button } from '@/components/ui';
import { DARK_THEME } from '@/constants/theme';
import { NoteSearchProps, NoteSearchParams, NoteFilter } from '@/types/note';

const NoteSearch = ({
  onSearch,
  placeholder = "Search notes...",
  showAdvancedFilters = true,
  defaultFilters = {}
}: NoteSearchProps) => {
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<NoteFilter>(defaultFilters);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search - FIX: prevent infinite loops
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Only search if there's actual keyword or filters change
    if (keyword.trim() || filters.isArchived) {
      const timeout = setTimeout(() => {
        const searchParams: NoteSearchParams = {
          keyword: keyword.trim() || undefined,
          includeArchived: filters.isArchived || false
        };
        onSearch(searchParams);
      }, 500); // Increased debounce time

      setSearchTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    } else {
      // If no keyword and no archive filter, trigger empty search only once
      const timeout = setTimeout(() => {
        onSearch({ keyword: undefined, includeArchived: false });
      }, 300);

      setSearchTimeout(timeout);
      return () => clearTimeout(timeout);
    }
  }, [keyword, filters.isArchived]); // Remove onSearch from dependencies to prevent loops

  const handleFilterChange = useCallback((key: keyof NoteFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setKeyword('');
  }, []);

  const hasActiveFilters = keyword.trim() || Object.values(filters).some(value =>
    value !== undefined && value !== false && value !== null
  );

  return (
    <div className="note-search">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
        </div>

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors"
          style={{
            backgroundColor: DARK_THEME.background.primary,
            borderColor: DARK_THEME.border.default,
            color: DARK_THEME.text.primary,
            '::placeholder': { color: DARK_THEME.text.muted }
          }}
        />

        {/* Clear search */}
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="absolute inset-y-0 right-8 flex items-center pr-1"
            title="Clear search"
          >
            <X className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
          </button>
        )}

        {/* Filter toggle */}
        {showAdvancedFilters && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${
              showFilters ? 'text-blue-500' : ''
            }`}
            title="Advanced filters"
            style={{
              color: showFilters ? DARK_THEME.primary : DARK_THEME.text.muted
            }}
          >
            <Filter className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && showFilters && (
        <div
          className="mt-3 p-4 rounded-md border"
          style={{
            backgroundColor: DARK_THEME.background.secondary,
            borderColor: DARK_THEME.border.default
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              className="text-sm font-medium"
              style={{ color: DARK_THEME.text.primary }}
            >
              Advanced Filters
            </h4>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs px-2 py-1"
                style={{ color: DARK_THEME.text.muted }}
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Include Archived */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeArchived"
                checked={filters.isArchived || false}
                onChange={(e) => handleFilterChange('isArchived', e.target.checked)}
                className="h-4 w-4 rounded border focus:ring-2"
                style={{
                  accentColor: DARK_THEME.primary,
                  borderColor: DARK_THEME.border.default
                }}
              />
              <label
                htmlFor="includeArchived"
                className="ml-2 text-sm cursor-pointer flex items-center gap-1"
                style={{ color: DARK_THEME.text.primary }}
              >
                <Archive className="h-3 w-3" />
                Include archived notes
              </label>
            </div>

            {/* Note Type Filter */}
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: DARK_THEME.text.muted }}
              >
                Note Type
              </label>
              <select
                value={filters.isPublic === undefined ? 'all' : filters.isPublic ? 'public' : 'private'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('isPublic',
                    value === 'all' ? undefined : value === 'public'
                  );
                }}
                className="w-full px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: DARK_THEME.background.primary,
                  borderColor: DARK_THEME.border.default,
                  color: DARK_THEME.text.primary
                }}
              >
                <option value="all">All notes</option>
                <option value="public">Public only</option>
                <option value="private">Private only</option>
              </select>
            </div>

            {/* Creator Filter (placeholder for future enhancement) */}
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: DARK_THEME.text.muted }}
              >
                Created by
              </label>
              <select
                disabled
                className="w-full px-2 py-1 text-sm rounded border opacity-50 cursor-not-allowed"
                style={{
                  backgroundColor: DARK_THEME.background.primary,
                  borderColor: DARK_THEME.border.default,
                  color: DARK_THEME.text.muted
                }}
              >
                <option>Anyone</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: DARK_THEME.border.muted }}>
              <div className="flex flex-wrap gap-2">
                {keyword.trim() && (
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: DARK_THEME.primary + '20',
                      color: DARK_THEME.primary
                    }}
                  >
                    Search: "{keyword.trim()}"
                  </span>
                )}

                {filters.isArchived && (
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: DARK_THEME.status.warning + '20',
                      color: DARK_THEME.status.warning
                    }}
                  >
                    Including archived
                  </span>
                )}

                {filters.isPublic === true && (
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: DARK_THEME.status.success + '20',
                      color: DARK_THEME.status.success
                    }}
                  >
                    Public only
                  </span>
                )}

                {filters.isPublic === false && (
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: DARK_THEME.status.info + '20',
                      color: DARK_THEME.status.info
                    }}
                  >
                    Private only
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteSearch;
