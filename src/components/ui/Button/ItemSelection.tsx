"use client";

import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface ItemSelectionProps {
  isSelected: boolean;
  onChange: () => void;
  className?: string;
}

const ItemSelection: React.FC<ItemSelectionProps> = ({
  isSelected,
  onChange,
  className = ''
}) => {
  const { theme } = useTheme();
  
  return (
    <button
      className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-colors ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{
        backgroundColor: isSelected ? theme.background.primary : 'rgba(255, 255, 255, 0.8)',
        border: isSelected ? 'none' : `1px solid ${theme.border.default}`,
        color: isSelected ? theme.text.primary : theme.text.secondary
      }}
    >
      {isSelected ? (
        <CheckSquare size={16} className="text-blue-500" />
      ) : (
        <Square size={16} />
      )}
    </button>
  );
};

export default ItemSelection;
