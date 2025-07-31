import { useState, useCallback } from "react";

export interface FilterOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface SortOption {
  id: string;
  label: string;
  description?: string;
  active?: boolean;
}

export interface UseFilterSortReturn {
  // Filter state
  isFilterOpen: boolean;
  selectedFilters: string[];
  filterOptions: FilterOption[];
  toggleFilter: () => void;
  closeFilter: () => void;
  toggleFilterOption: (filterId: string) => void;
  clearFilters: () => void;

  // Sort state
  isSortOpen: boolean;
  selectedSort: string;
  sortOptions: SortOption[];
  toggleSort: () => void;
  closeSort: () => void;
  selectSort: (sortId: string) => void;
}

export function useFilterSort(): UseFilterSortReturn {
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Sort state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("newest");

  // Filter options for inbox
  const filterOptions: FilterOption[] = [
    {
      id: "mentioned",
      label: "Mentioned",
      active: selectedFilters.includes("mentioned"),
    },
    {
      id: "assigned-to-me",
      label: "Assigned to me",
      active: selectedFilters.includes("assigned-to-me"),
    },
    {
      id: "assigned-by-me",
      label: "Assigned by me",
      active: selectedFilters.includes("assigned-by-me"),
    },
    {
      id: "unread",
      label: "Unread only",
      active: selectedFilters.includes("unread"),
    },
    {
      id: "for-me",
      label: "For me",
      active: selectedFilters.includes("for-me"),
    },
  ];

  // Sort options for inbox
  const sortOptions: SortOption[] = [
    {
      id: "newest",
      label: "Newest",
      description: "See most recent notifications first",
      active: selectedSort === "newest",
    },
    {
      id: "relevance",
      label: "Relevance",
      description: "See timely, actionable notifications first",
      active: selectedSort === "relevance",
    },
  ];

  // Filter actions
  const toggleFilter = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
    setIsSortOpen(false); // Close sort when opening filter
  }, []);

  const closeFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const toggleFilterOption = useCallback((filterId: string) => {
    setSelectedFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((id) => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

  // Sort actions
  const toggleSort = useCallback(() => {
    setIsSortOpen((prev) => !prev);
    setIsFilterOpen(false); // Close filter when opening sort
  }, []);

  const closeSort = useCallback(() => {
    setIsSortOpen(false);
  }, []);

  const selectSort = useCallback((sortId: string) => {
    setSelectedSort(sortId);
    setIsSortOpen(false); // Close dropdown after selection
  }, []);

  return {
    // Filter
    isFilterOpen,
    selectedFilters,
    filterOptions,
    toggleFilter,
    closeFilter,
    toggleFilterOption,
    clearFilters,

    // Sort
    isSortOpen,
    selectedSort,
    sortOptions,
    toggleSort,
    closeSort,
    selectSort,
  };
} 