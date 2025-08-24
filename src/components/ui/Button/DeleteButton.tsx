"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface DeleteButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  className = ''
}) => {
  const { theme } = useTheme();
  
  return (
    <button
      className={`p-1.5 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      style={{
        backgroundColor: theme.background.primary,
        color: '#ef4444', // Red color for delete
        border: `1px solid ${theme.border.default}`
      }}
    >
      <Trash2 size={16} />
    </button>
  );
};

export default DeleteButton;
