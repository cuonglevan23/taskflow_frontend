"use client";

import React from 'react';
import Button from './Button';

// Checkbox component with proper styling
export interface SelectionCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export const SelectionCheckbox = ({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  label,
  id
}: SelectionCheckboxProps) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="flex items-center gap-2">
      <input
        ref={checkboxRef}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.checked);
        }}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
      />
      {label && (
        <label 
          htmlFor={id}
          className="text-sm text-gray-600 dark:text-gray-400 select-none cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
};

// Select All component
export interface SelectAllControlProps {
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export const SelectAllControl = ({
  totalCount,
  selectedCount,
  onSelectAll,
  onClearSelection,
  disabled = false
}: SelectAllControlProps) => {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const handleToggle = () => {
    if (isAllSelected || isPartiallySelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <SelectionCheckbox
        checked={isAllSelected}
        indeterminate={isPartiallySelected}
        onChange={handleToggle}
        disabled={disabled}
        label={`Select all ${totalCount} items`}
        id="select-all-control"
      />
      
      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
            {selectedCount} of {totalCount} selected
          </span>
          
          {isPartiallySelected && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onSelectAll}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Select all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Individual item selection component
export interface ItemSelectionProps {
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export const ItemSelection = ({
  selected,
  onToggle,
  disabled = false,
  className = ""
}: ItemSelectionProps) => (
  <div className={`absolute top-2 left-2 z-10 ${className}`}>
    <div className={`transition-all duration-200 ${selected ? 'scale-110' : ''}`}>
      <SelectionCheckbox
        checked={selected}
        onChange={onToggle}
        disabled={disabled}
      />
    </div>
  </div>
);

// Selection badge for showing selected state
export interface SelectionBadgeProps {
  isSelected: boolean;
  className?: string;
}

export const SelectionBadge = ({ isSelected, className = "" }: SelectionBadgeProps) => {
  if (!isSelected) return null;

  return (
    <div className={`absolute top-2 right-2 z-10 ${className}`}>
      <div className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
        ✓
      </div>
    </div>
  );
};