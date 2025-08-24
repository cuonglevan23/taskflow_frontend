"use client";

import React from 'react';
import { CheckSquare, Square, X } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface SelectAllControlProps {
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const SelectAllControl: React.FC<SelectAllControlProps> = ({
  totalCount,
  selectedCount,
  onSelectAll,
  onClearSelection,
}) => {
  const { theme } = useTheme();
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="flex items-center mb-4">
      <button
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={onSelectAll}
        style={{ color: theme.text.secondary }}
      >
        {isAllSelected ? (
          <CheckSquare size={18} className="text-blue-500" />
        ) : (
          <Square size={18} />
        )}
        <span className="text-sm">
          {isAllSelected
            ? "All items selected"
            : isPartiallySelected
            ? `${selectedCount} of ${totalCount} selected`
            : "Select all"}
        </span>
      </button>

      {selectedCount > 0 && (
        <button
          className="ml-3 p-1.5 text-sm flex items-center gap-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onClearSelection}
          style={{ color: theme.text.secondary }}
        >
          <X size={16} />
          Clear selection
        </button>
      )}
    </div>
  );
};

export default SelectAllControl;
