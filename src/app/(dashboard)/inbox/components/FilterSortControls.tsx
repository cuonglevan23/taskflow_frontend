"use client";

import React from "react";
import { ListFilter, ArrowUpDown, Check } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { Button } from "@/components/ui";
import Dropdown, {
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown/Dropdown";
import { useFilterSort } from "../hooks/useFilterSort";

interface FilterSortControlsProps {
  className?: string;
}

const FilterSortControls = ({
  className = "",
}: FilterSortControlsProps) => {
  const { theme } = useTheme();
  const {
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
  } = useFilterSort();

  // Get current sort label
  const currentSortLabel =
    sortOptions.find((option) => option.id === selectedSort)?.label || "Newest";

  return (
    <div
      className={`flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end ${className}`}
    >
      {/* Filter Dropdown */}
      <Dropdown
        isOpen={isFilterOpen}
        onOpenChange={(open) => (open ? toggleFilter() : closeFilter())}
        placement="bottom-left"
        contentClassName="min-w-80 !border-0 !bg-transparent !shadow-2xl"
        trigger={
          <Button
            variant="ghost"
            size="sm"
            icon={<ListFilter className="w-4 h-4" />}
            className="!p-2 relative"
          >
            <span className="hidden xs:inline">Filter</span>
            {selectedFilters.length > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                style={{ backgroundColor: theme.button.primary.background }}
              >
                {selectedFilters.length}
              </span>
            )}
          </Button>
        }
      >
        <div
          className="p-4 rounded-xl shadow-2xl border"
          style={{
            backgroundColor: theme.background.primary,
            color: theme.text.primary,
            borderColor: theme.border.default,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-semibold"
              style={{ color: theme.text.primary }}
            >
              Filters
            </h3>
            {selectedFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: theme.text.secondary }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick filters section */}
          <div className="mb-4">
            <h4
              className="text-sm font-medium mb-3"
              style={{ color: theme.text.secondary }}
            >
              Quick filters
            </h4>
            <div className="space-y-1">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleFilterOption(option.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-150 hover:opacity-80 ${
                    option.active ? "opacity-100" : "opacity-70"
                  }`}
                  style={{
                    backgroundColor: option.active
                      ? theme.button.primary.background + "20"
                      : "transparent",
                    color: option.active
                      ? theme.button.primary.background
                      : theme.text.primary,
                    border: `1px solid ${
                      option.active
                        ? theme.button.primary.background
                        : theme.border.default
                    }`,
                  }}
                >
                  <span>{option.label}</span>
                  {option.active && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: theme.button.primary.background }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            className="my-2 border-t"
            style={{ borderColor: theme.border.default }}
          />

          {/* Add filter button */}
          <button
            onClick={() => {
              console.log("Add custom filter");
            }}
            className="w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
            style={{
              color: theme.text.secondary,
              backgroundColor: "transparent",
            }}
          >
            <span className="mr-3">+</span>
            Add filter
          </button>
        </div>
      </Dropdown>

      {/* Sort Dropdown */}
      <Dropdown
        isOpen={isSortOpen}
        onOpenChange={(open) => (open ? toggleSort() : closeSort())}
        placement="bottom-right"
        contentClassName="min-w-64 !border-0 !bg-transparent !shadow-2xl"
        trigger={
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowUpDown className="w-4 h-4" />}
            className="!p-2"
          >
            <span className="hidden xs:inline">Sort: {currentSortLabel}</span>
          </Button>
        }
      >
        <div
          className="p-3 rounded-xl shadow-2xl border"
          style={{
            backgroundColor: theme.background.primary,
            color: theme.text.primary,
            borderColor: theme.border.default,
          }}
        >
          {/* Header */}
          <div
            className="px-2 py-2 mb-2"
            style={{
              borderBottom: `1px solid ${theme.border.default}`,
            }}
          >
            <h3
              className="text-sm font-medium"
              style={{ color: theme.text.primary }}
            >
              Sort: {currentSortLabel}
            </h3>
          </div>

          {/* Sort options */}
          <div className="space-y-1">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => selectSort(option.id)}
                className="w-full flex items-start px-2 py-3 text-left rounded-lg transition-all duration-150 hover:opacity-80"
                style={{
                  backgroundColor: option.active
                    ? theme.button.primary.background + "15"
                    : "transparent",
                  color: option.active
                    ? theme.button.primary.background
                    : theme.text.primary,
                }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  {option.description && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: theme.text.secondary }}
                    >
                      {option.description}
                    </div>
                  )}
                </div>
                {option.active && (
                  <Check
                    className="w-4 h-4 mt-0.5 ml-2"
                    style={{ color: theme.button.primary.background }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default FilterSortControls;
