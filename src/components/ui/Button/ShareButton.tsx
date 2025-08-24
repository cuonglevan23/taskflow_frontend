"use client";

import React from 'react';
import { Share2 } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface ShareButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  onClick,
  className = ''
}) => {
  const { theme } = useTheme();
  
  return (
    <button
      className={`p-1.5 rounded-md transition-colors ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      style={{
        backgroundColor: theme.background.primary,
        color: theme.text.secondary,
        border: `1px solid ${theme.border.default}`
      }}
    >
      <Share2 size={16} />
    </button>
  );
};

export default ShareButton;
