import { useState, useCallback } from 'react';

interface UseNotificationSelectionReturn {
  selectedIds: Set<number>;
  isSelected: (id: number) => boolean;
  selectedCount: number;

  // Selection actions
  selectNotification: (id: number) => void;
  deselectNotification: (id: number) => void;
  toggleSelection: (id: number) => void;
  selectAll: (ids: number[]) => void;
  deselectAll: () => void;
  toggleSelectAll: (ids: number[]) => void;

  // Bulk action helpers
  getSelectedNotifications: <T extends { id: number }>(notifications: T[]) => T[];
  hasSelection: boolean;

  // Functions that take available IDs as parameter
  getIsAllSelected: (availableIds: number[]) => boolean;
  getIsIndeterminate: (availableIds: number[]) => boolean;
}

/**
 * Hook for managing notification selection state and bulk actions
 */
export const useNotificationSelection = (): UseNotificationSelectionReturn => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Check if a notification is selected
  const isSelected = useCallback((id: number): boolean => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Selection actions
  const selectNotification = useCallback((id: number) => {
    setSelectedIds(prev => new Set([...prev, id]));
  }, []);

  const deselectNotification = useCallback((id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectAll = useCallback((ids: number[]) => {
    setSelectedIds(prev => {
      // If all are selected, deselect all
      if (ids.every(id => prev.has(id))) {
        return new Set();
      }
      // Otherwise, select all
      return new Set(ids);
    });
  }, []);

  // Get selected notifications
  const getSelectedNotifications = useCallback(<T extends { id: number }>(notifications: T[]): T[] => {
    return notifications.filter(notification => selectedIds.has(notification.id));
  }, [selectedIds]);

  // Functions that calculate selection state based on available IDs
  const getIsAllSelected = useCallback((availableIds: number[]): boolean => {
    return availableIds.length > 0 && availableIds.every(id => selectedIds.has(id));
  }, [selectedIds]);

  const getIsIndeterminate = useCallback((availableIds: number[]): boolean => {
    const selectedCount = availableIds.filter(id => selectedIds.has(id)).length;
    return selectedCount > 0 && selectedCount < availableIds.length;
  }, [selectedIds]);

  // Computed properties
  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  return {
    selectedIds,
    isSelected,
    selectedCount,

    // Actions
    selectNotification,
    deselectNotification,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,

    // Helpers
    getSelectedNotifications,
    hasSelection,

    // Functions for selection state
    getIsAllSelected,
    getIsIndeterminate
  };
};
