"use client";

import React from 'react';
import Button from './Button';

// Icons components
const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
  </svg>
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ClearIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// Action Button Components
export interface ShareButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "outline";
  count?: number;
}

export const ShareButton = ({ 
  onClick, 
  loading = false, 
  disabled = false,
  size = "sm",
  variant = "secondary",
  count
}: ShareButtonProps) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    loading={loading}
    disabled={disabled}
    leftIcon={<ShareIcon className="w-4 h-4" />}
    className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
  >
    Share{count ? ` (${count})` : ''}
  </Button>
);

export interface DeleteButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "danger" | "outline-danger" | "ghost";
  count?: number;
  confirmText?: string;
}

export const DeleteButton = ({ 
  onClick, 
  loading = false, 
  disabled = false,
  size = "sm",
  variant = "outline-danger",
  count,
  confirmText
}: DeleteButtonProps) => {
  const handleClick = () => {
    if (confirmText) {
      if (window.confirm(confirmText)) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      loading={loading}
      disabled={disabled}
      leftIcon={<DeleteIcon className="w-4 h-4" />}
    >
      Delete{count ? ` (${count})` : ''}
    </Button>
  );
};

export interface ClearButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "ghost" | "outline" | "secondary";
}

export const ClearButton = ({ 
  onClick, 
  loading = false, 
  disabled = false,
  size = "sm",
  variant = "ghost"
}: ClearButtonProps) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    loading={loading}
    disabled={disabled}
    leftIcon={<ClearIcon className="w-4 h-4" />}
  >
    Clear
  </Button>
);

export interface DownloadButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "secondary" | "outline" | "ghost";
}

export const DownloadButton = ({ 
  onClick, 
  loading = false, 
  disabled = false,
  size = "sm",
  variant = "secondary"
}: DownloadButtonProps) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    loading={loading}
    disabled={disabled}
    leftIcon={<DownloadIcon className="w-4 h-4" />}
    className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
  >
    Download
  </Button>
);

// Bulk Actions Component
export interface BulkActionsProps {
  selectedCount: number;
  onShare: () => void;
  onDelete: () => void;
  onClear: () => void;
  onMove?: () => void;
  loading?: {
    share?: boolean;
    delete?: boolean;
    move?: boolean;
  };
}

export const BulkActions = ({
  selectedCount,
  onShare,
  onDelete,
  onClear,
  onMove,
  loading = {}
}: BulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full">
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
              {selectedCount}
            </span>
          </div>
          <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {onMove && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMove}
              loading={loading.move}
              className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              Move
            </Button>
          )}
          
          <ShareButton
            onClick={onShare}
            loading={loading.share}
            count={selectedCount}
            variant="outline"
          />
          
          <DeleteButton
            onClick={onDelete}
            loading={loading.delete}
            count={selectedCount}
            confirmText={`Are you sure you want to delete ${selectedCount} item${selectedCount > 1 ? 's' : ''}?`}
          />
          
          <ClearButton
            onClick={onClear}
          />
        </div>
      </div>
    </div>
  );
};