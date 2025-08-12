// Task Filter & Pagination Hooks - State management for filters
import { useState, useCallback, useMemo } from 'react';
import type { TaskFilter, TaskSort } from '@/services/task';

// Hook: Manage task filters
export const useTasksFilter = (initialFilter?: TaskFilter) => {
  const [filter, setFilter] = useState<TaskFilter>(initialFilter || {});
  
  const updateFilter = useCallback((newFilter: Partial<TaskFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);
  
  const clearFilter = useCallback(() => {
    setFilter({});
  }, []);
  
  const setStatusFilter = useCallback((status: string[]) => {
    setFilter(prev => ({ ...prev, status }));
  }, []);
  
  const setPriorityFilter = useCallback((priority: string[]) => {
    setFilter(prev => ({ ...prev, priority }));
  }, []);
  
  const setAssigneeFilter = useCallback((assignee: string) => {
    setFilter(prev => ({ ...prev, assignee }));
  }, []);
  
  const setProjectFilter = useCallback((projectId: number) => {
    setFilter(prev => ({ ...prev, projectId }));
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filter).some(key => {
      const value = filter[key as keyof TaskFilter];
      return Array.isArray(value) ? value.length > 0 : !!value;
    });
  }, [filter]);

  return {
    filter,
    setFilter,
    updateFilter,
    clearFilter,
    setStatusFilter,
    setPriorityFilter,
    setAssigneeFilter,
    setProjectFilter,
    hasActiveFilters,
  };
};

// Hook: Manage task sorting
export const useTasksSort = (initialSort?: TaskSort) => {
  const [sort, setSort] = useState<TaskSort>(initialSort || { field: 'updatedAt', direction: 'desc' });
  
  const updateSort = useCallback((field: string, direction?: 'asc' | 'desc') => {
    setSort(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc')
    }));
  }, []);
  
  const toggleSortDirection = useCallback(() => {
    setSort(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  return {
    sort,
    setSort,
    updateSort,
    toggleSortDirection,
  };
};

// Hook: Manage pagination
export const useTasksPagination = (initialPage = 0, initialSize = 20) => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  
  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);
  
  const previousPage = useCallback(() => {
    setPage(prev => Math.max(0, prev - 1));
  }, []);
  
  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(0, newPage));
  }, []);
  
  const changePageSize = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when changing size
  }, []);
  
  const resetPagination = useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    size,
    setPage,
    setSize,
    nextPage,
    previousPage,
    goToPage,
    changePageSize,
    resetPagination,
  };
};

// Hook: Combined filter, sort, and pagination
export const useTasksFilterState = (initialParams?: {
  filter?: TaskFilter;
  sort?: TaskSort;
  page?: number;
  size?: number;
}) => {
  const filterHook = useTasksFilter(initialParams?.filter);
  const sortHook = useTasksSort(initialParams?.sort);
  const paginationHook = useTasksPagination(initialParams?.page, initialParams?.size);
  
  // Reset pagination when filter or sort changes
  const updateFilter = useCallback((newFilter: Partial<TaskFilter>) => {
    filterHook.updateFilter(newFilter);
    paginationHook.resetPagination();
  }, [filterHook.updateFilter, paginationHook.resetPagination]);
  
  const updateSort = useCallback((field: string, direction?: 'asc' | 'desc') => {
    sortHook.updateSort(field, direction);
    paginationHook.resetPagination();
  }, [sortHook.updateSort, paginationHook.resetPagination]);

  // Combined params for API calls
  const apiParams = useMemo(() => ({
    filter: filterHook.filter,
    sort: sortHook.sort,
    page: paginationHook.page,
    limit: paginationHook.size,
  }), [filterHook.filter, sortHook.sort, paginationHook.page, paginationHook.size]);

  return {
    // Filter
    filter: filterHook.filter,
    updateFilter,
    clearFilter: filterHook.clearFilter,
    hasActiveFilters: filterHook.hasActiveFilters,
    
    // Sort
    sort: sortHook.sort,
    updateSort,
    toggleSortDirection: sortHook.toggleSortDirection,
    
    // Pagination
    page: paginationHook.page,
    size: paginationHook.size,
    nextPage: paginationHook.nextPage,
    previousPage: paginationHook.previousPage,
    goToPage: paginationHook.goToPage,
    changePageSize: paginationHook.changePageSize,
    
    // Combined
    apiParams,
  };
};