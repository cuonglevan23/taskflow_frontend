"use client";

import React from 'react';
import Button from './Button';
import { Share, Trash2, FolderOpen, X } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface BulkActionsProps {
  selectedCount: number;
  onShare: () => void;
  onDelete: () => void;
  onMove: () => void;
  onClear: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onShare,
  onDelete,
  onMove,
  onClear,
}) => {
  const { theme } = useTheme();
  
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div 
      className="mb-4 p-3 rounded-lg flex items-center justify-between"
      style={{ 
        backgroundColor: theme.background.secondary,
        borderLeft: `3px solid ${theme.border.focus}` 
      }}
    >
      <div className="flex items-center">
        <span className="font-medium mr-2" style={{ color: theme.text.primary }}>
          {selectedCount} items selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          leftIcon={<Share size={16} />}
        >
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMove}
          leftIcon={<FolderOpen size={16} />}
        >
          Move
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          leftIcon={<Trash2 size={16} className="text-red-500" />}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Delete
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          leftIcon={<X size={16} />}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default BulkActions;
