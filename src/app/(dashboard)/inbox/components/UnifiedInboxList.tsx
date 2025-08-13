"use client";

import React, { useState, useMemo } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useInboxNotifications, NotificationFilters, NotificationType, NotificationPriority } from "@/contexts/NotificationContext";
import UnifiedInboxNotificationItem from "./UnifiedInboxNotificationItem";
import { Search, Filter, CheckSquare, Archive, Star, RefreshCw, MoreHorizontal } from "lucide-react";

interface UnifiedInboxListProps {
  className?: string;
}

const UnifiedInboxList = ({ className = "" }: UnifiedInboxListProps) => {
  const { theme } = useTheme();
  const { notifications, actions, isLoading, stats } = useInboxNotifications();
  
  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<NotificationFilters>({});
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);

  // Filter notifications based on search and filters
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content?.toLowerCase().includes(query) ||
        n.message?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (activeFilters.type?.length) {
      filtered = filtered.filter(n => activeFilters.type!.includes(n.type));
    }

    // Priority filter
    if (activeFilters.priority?.length) {
      filtered = filtered.filter(n => activeFilters.priority!.includes(n.priority));
    }

    // Status filter
    if (activeFilters.status?.length) {
      filtered = filtered.filter(n => activeFilters.status!.includes(n.status));
    }

    return filtered;
  }, [notifications, searchQuery, activeFilters]);

  // Selection handlers
  const handleToggleSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedNotifications([]);
  };

  // Bulk actions
  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await actions.bulkMarkAsRead(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedNotifications.length > 0) {
      await actions.bulkArchive(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length > 0) {
      await actions.bulkDelete(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  // Filter handlers
  const handleTypeFilter = (type: NotificationType) => {
    setActiveFilters(prev => ({
      ...prev,
      type: prev.type?.includes(type) 
        ? prev.type.filter(t => t !== type)
        : [...(prev.type || []), type]
    }));
  };

  const handlePriorityFilter = (priority: NotificationPriority) => {
    setActiveFilters(prev => ({
      ...prev,
      priority: prev.priority?.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...(prev.priority || []), priority]
    }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : !!filter
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div 
        className="flex-shrink-0 p-4 border-b"
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default 
        }}
      >
        {/* Search and Actions */}
        <div className="flex items-center gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.text.secondary }} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary,
              }}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${hasActiveFilters ? 'bg-blue-500 text-white' : ''}`}
            style={{
              borderColor: theme.border.default,
              backgroundColor: hasActiveFilters ? '#3b82f6' : theme.background.secondary,
              color: hasActiveFilters ? 'white' : theme.text.primary,
            }}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Refresh */}
          <button
            onClick={actions.refreshNotifications}
            disabled={isLoading}
            className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{
              borderColor: theme.border.default,
              backgroundColor: theme.background.secondary,
              color: theme.text.primary,
            }}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div 
            className="p-4 rounded-lg border mb-4"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium" style={{ color: theme.text.primary }}>Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Type filters */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: theme.text.primary }}>
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['task', 'project', 'message', 'reminder', 'system'] as NotificationType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => handleTypeFilter(type)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        activeFilters.type?.includes(type) ? 'bg-blue-500 text-white border-blue-500' : ''
                      }`}
                      style={{
                        borderColor: activeFilters.type?.includes(type) ? '#3b82f6' : theme.border.default,
                        backgroundColor: activeFilters.type?.includes(type) ? '#3b82f6' : theme.background.primary,
                        color: activeFilters.type?.includes(type) ? 'white' : theme.text.primary,
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority filters */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: theme.text.primary }}>
                  Priority
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['urgent', 'high', 'medium', 'low'] as NotificationPriority[]).map(priority => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityFilter(priority)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        activeFilters.priority?.includes(priority) ? 'bg-blue-500 text-white border-blue-500' : ''
                      }`}
                      style={{
                        borderColor: activeFilters.priority?.includes(priority) ? '#3b82f6' : theme.border.default,
                        backgroundColor: activeFilters.priority?.includes(priority) ? '#3b82f6' : theme.background.primary,
                        color: activeFilters.priority?.includes(priority) ? 'white' : theme.text.primary,
                      }}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div 
            className="flex items-center justify-between p-3 rounded-lg border"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: theme.text.primary }}>
                {selectedNotifications.length} selected
              </span>
              <button
                onClick={handleClearSelection}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Mark as read"
              >
                <CheckSquare className="w-4 h-4" style={{ color: theme.text.secondary }} />
              </button>
              
              <button
                onClick={handleBulkArchive}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Archive"
              >
                <Archive className="w-4 h-4" style={{ color: theme.text.secondary }} />
              </button>
              
              <button
                onClick={handleBulkDelete}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500"
                title="Delete"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm" style={{ color: theme.text.secondary }}>
          <div className="flex items-center gap-4">
            <span>{stats.total} total</span>
            <span>{stats.unread} unread</span>
            <span>{stats.bookmarked} bookmarked</span>
          </div>
          
          {filteredNotifications.length !== notifications.length && (
            <span>{filteredNotifications.length} filtered</span>
          )}
        </div>
      </div>

      {/* Select All */}
      {filteredNotifications.length > 0 && (
        <div 
          className="flex-shrink-0 px-4 py-2 border-b"
          style={{ 
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default 
          }}
        >
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors"
            style={{ color: theme.text.secondary }}
          >
            <CheckSquare className="w-4 h-4" />
            {selectedNotifications.length === filteredNotifications.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2" style={{ color: theme.text.secondary }}>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading notifications...</span>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center" style={{ color: theme.text.secondary }}>
              <div className="text-4xl mb-2">📭</div>
              <div>No notifications found</div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-500 hover:text-blue-600 text-sm mt-1"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.border.default }}>
            {filteredNotifications.map((notification) => (
              <UnifiedInboxNotificationItem
                key={notification.id}
                notification={notification}
                actions={actions}
                isLoading={isLoading}
                isSelected={selectedNotifications.includes(notification.id)}
                showMoreMenu={showMoreMenu === notification.id}
                onToggleSelection={handleToggleSelection}
                onHideMoreActions={() => setShowMoreMenu(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedInboxList;