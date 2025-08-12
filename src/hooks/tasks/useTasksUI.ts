// Task UI State Hooks - Modal, selection, view state management
import { useState, useCallback, useMemo } from 'react';
import type { Task } from '@/types/task';

// Hook: Manage task selection
export const useTaskSelection = () => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  
  const selectTask = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => new Set([...prev, taskId]));
  }, []);
  
  const deselectTask = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  }, []);
  
  const toggleTask = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);
  
  const selectAll = useCallback((taskIds: string[]) => {
    setSelectedTaskIds(new Set(taskIds));
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
  }, []);
  
  const isSelected = useCallback((taskId: string) => {
    return selectedTaskIds.has(taskId);
  }, [selectedTaskIds]);

  const selectedCount = useMemo(() => selectedTaskIds.size, [selectedTaskIds]);
  const hasSelection = useMemo(() => selectedTaskIds.size > 0, [selectedTaskIds]);

  return {
    selectedTaskIds: Array.from(selectedTaskIds),
    selectedCount,
    hasSelection,
    selectTask,
    deselectTask,
    toggleTask,
    selectAll,
    clearSelection,
    isSelected,
  };
};

// Hook: Manage modal states
export const useTaskModals = () => {
  const [modals, setModals] = useState({
    createTask: false,
    editTask: false,
    deleteTask: false,
    assignTask: false,
    bulkEdit: false,
    taskDetails: false,
  });
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  const openModal = useCallback((modalName: keyof typeof modals, taskId?: string) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (taskId) setActiveTaskId(taskId);
  }, []);
  
  const closeModal = useCallback((modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName === 'editTask' || modalName === 'deleteTask' || modalName === 'taskDetails') {
      setActiveTaskId(null);
    }
  }, []);
  
  const closeAllModals = useCallback(() => {
    setModals({
      createTask: false,
      editTask: false,
      deleteTask: false,
      assignTask: false,
      bulkEdit: false,
      taskDetails: false,
    });
    setActiveTaskId(null);
  }, []);

  return {
    modals,
    activeTaskId,
    setActiveTaskId,
    openModal,
    closeModal,
    closeAllModals,
  };
};

// Hook: Manage view states
export const useTasksView = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar' | 'kanban'>('list');
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'priority' | 'assignee' | 'project'>('none');
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const modes = ['list', 'grid', 'calendar', 'kanban'] as const;
      const currentIndex = modes.indexOf(prev);
      return modes[(currentIndex + 1) % modes.length];
    });
  }, []);
  
  const toggleCompletedTasks = useCallback(() => {
    setShowCompletedTasks(prev => !prev);
  }, []);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    showCompletedTasks,
    setShowCompletedTasks,
    toggleCompletedTasks,
    groupBy,
    setGroupBy,
    density,
    setDensity,
  };
};

// Hook: Manage dropdown and menu states
export const useTasksDropdowns = () => {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  
  const toggleDropdown = useCallback((dropdownId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  }, []);
  
  const openDropdown = useCallback((dropdownId: string) => {
    setOpenDropdowns(prev => ({ ...prev, [dropdownId]: true }));
  }, []);
  
  const closeDropdown = useCallback((dropdownId: string) => {
    setOpenDropdowns(prev => ({ ...prev, [dropdownId]: false }));
  }, []);
  
  const closeAllDropdowns = useCallback(() => {
    setOpenDropdowns({});
  }, []);
  
  const isDropdownOpen = useCallback((dropdownId: string) => {
    return !!openDropdowns[dropdownId];
  }, [openDropdowns]);

  return {
    openDropdowns,
    toggleDropdown,
    openDropdown,
    closeDropdown,
    closeAllDropdowns,
    isDropdownOpen,
  };
};

// Hook: Manage task search and quick filters
export const useTasksSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'assigned' | 'created' | 'overdue' | 'today'>('all');
  
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);
  
  const hasActiveSearch = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    hasActiveSearch,
    quickFilter,
    setQuickFilter,
  };
};