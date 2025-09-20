"use client";

import React, { useState } from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, SortAsc } from "lucide-react";

interface FilterSortControlsProps {
  onFilterChange?: (filters: FilterOptions) => void;
  onSortChange?: (sort: SortOptions) => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  onMarkAsRead?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

interface FilterOptions {
  readStatus: 'all' | 'read' | 'unread';
  type: 'allTypes' | 'tasks' | 'posts' | 'meetings' | 'system';
}

interface SortOptions {
  field: 'dateCreated' | 'dateRead' | 'priority';
  order: 'newest' | 'oldest';
}

export default function FilterSortControls({
  onFilterChange,
  onSortChange,
  selectedCount = 0,
  onClearSelection,
  onMarkAsRead,
  onArchive,
  onDelete
}: FilterSortControlsProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const [filters, setFilters] = useState<FilterOptions>({
    readStatus: 'all',
    type: 'allTypes'
  });

  const [sort, setSort] = useState<SortOptions>({
    field: 'dateCreated',
    order: 'newest'
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (field: string, order?: string) => {
    const newSort = {
      field: field as SortOptions['field'],
      order: order || sort.order
    } as SortOptions;
    setSort(newSort);
    onSortChange?.(newSort);
  };

  const clearAllFilters = () => {
    const defaultFilters = { readStatus: 'all' as const, type: 'allTypes' as const };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const hasActiveFilters = filters.readStatus !== 'all' || filters.type !== 'allTypes';

  // Get translated messages
  const filterMessages = messages?.filters || {};
  const bulkMessages = messages?.bulkActions || {};

  return (
    <div
      className="flex flex-col gap-4 p-4 border-b"
      style={{
        borderColor: theme.border.default,
        backgroundColor: theme.background.primary
      }}
    >
      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{
            backgroundColor: theme.status.info + '20',
            border: `1px solid ${theme.status.info + '40'}`
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: theme.text.primary }}
          >
            {bulkMessages.selected?.replace('{count}', selectedCount.toString()) || `${selectedCount} selected`}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="text-xs"
              style={{
                borderColor: theme.border.default,
                color: theme.text.secondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.secondary;
              }}
            >
              {bulkMessages.clearSelection || 'Clear Selection'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAsRead}
              className="text-xs"
              style={{
                borderColor: theme.border.default,
                color: theme.text.secondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.secondary;
              }}
            >
              {bulkMessages.markAsRead || 'Mark as Read'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onArchive}
              className="text-xs"
              style={{
                borderColor: theme.border.default,
                color: theme.text.secondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.secondary;
              }}
            >
              {bulkMessages.archive || 'Archive'}
            </Button>
            <Button
              size="sm"
              onClick={onDelete}
              className="text-xs"
              style={{
                backgroundColor: theme.status.error,
                color: 'white',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.status.error + 'dd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.status.error;
              }}
            >
              {bulkMessages.delete || 'Delete'}
            </Button>
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Section */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: theme.text.muted }} />
          <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
            {filterMessages.filter || 'Filter'}:
          </span>

          {/* Read Status Filter */}
          <Select
            value={filters.readStatus}
            onValueChange={(value) => handleFilterChange('readStatus', value)}
          >
            <SelectTrigger
              className="w-32"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default
              }}
            >
              <SelectItem
                value="all"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.all || 'All'}
              </SelectItem>
              <SelectItem
                value="unread"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.unread || 'Unread'}
              </SelectItem>
              <SelectItem
                value="read"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.read || 'Read'}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger
              className="w-36"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default
              }}
            >
              <SelectItem
                value="allTypes"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.allTypes || 'All Types'}
              </SelectItem>
              <SelectItem
                value="tasks"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.tasks || 'Tasks'}
              </SelectItem>
              <SelectItem
                value="posts"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.posts || 'Posts'}
              </SelectItem>
              <SelectItem
                value="meetings"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.meetings || 'Meetings'}
              </SelectItem>
              <SelectItem
                value="system"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.system || 'System'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Section */}
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4" style={{ color: theme.text.muted }} />
          <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
            {filterMessages.sort || 'Sort'}:
          </span>

          {/* Sort Field */}
          <Select
            value={sort.field}
            onValueChange={(value) => handleSortChange(value)}
          >
            <SelectTrigger
              className="w-32"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default
              }}
            >
              <SelectItem
                value="dateCreated"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.dateCreated || 'Date Created'}
              </SelectItem>
              <SelectItem
                value="dateRead"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.dateRead || 'Date Read'}
              </SelectItem>
              <SelectItem
                value="priority"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.priority || 'Priority'}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select
            value={sort.order}
            onValueChange={(value) => handleSortChange(sort.field, value)}
          >
            <SelectTrigger
              className="w-28"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default
              }}
            >
              <SelectItem
                value="newest"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.newest || 'Newest'}
              </SelectItem>
              <SelectItem
                value="oldest"
                style={{ color: theme.text.primary }}
              >
                {filterMessages.oldest || 'Oldest'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
            style={{
              color: theme.text.muted,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.text.muted;
            }}
          >
            <X className="h-3 w-3 mr-1" />
            {filterMessages.clearAllFilters || 'Clear All Filters'}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: theme.text.muted }}>
            Active filters:
          </span>
          {filters.readStatus !== 'all' && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: theme.background.tertiary,
                color: theme.text.secondary,
                border: `1px solid ${theme.border.muted}`
              }}
            >
              {filterMessages[filters.readStatus] || filters.readStatus}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange('readStatus', 'all')}
                style={{ color: theme.text.muted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.muted;
                }}
              />
            </Badge>
          )}
          {filters.type !== 'allTypes' && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: theme.background.tertiary,
                color: theme.text.secondary,
                border: `1px solid ${theme.border.muted}`
              }}
            >
              {filterMessages[filters.type] || filters.type}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange('type', 'allTypes')}
                style={{ color: theme.text.muted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.muted;
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
