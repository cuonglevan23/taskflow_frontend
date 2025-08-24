"use client";

import React from 'react';
import { Download } from 'lucide-react';
import { useTheme } from '@/layouts/hooks/useTheme';

interface DownloadButtonProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
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
      <Download size={16} />
    </button>
  );
};

export default DownloadButton;
