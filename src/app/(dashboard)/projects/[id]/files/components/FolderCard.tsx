"use client";

import React, { useState } from 'react';
import { FileFolder } from '../context/ProjectFilesContext';
import { FileActions } from '../hooks/useProjectFileActions';
import { useTheme } from '@/layouts/hooks/useTheme';
import { Button } from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

interface FolderCardProps {
  folder: FileFolder;
  actions: FileActions;
}

export function FolderCard({ folder, actions }: FolderCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const handleFolderClick = () => {
    actions.onFolderNavigate(folder.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.onFolderDelete(folder.id);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Enter new folder name:', folder.name);
    if (newName && newName.trim() && newName.trim() !== folder.name) {
      actions.onFolderRename(folder.id, newName.trim());
    }
  };

  return (
    <div
      className="group relative cursor-pointer transition-all duration-200"
      onClick={handleFolderClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="rounded-lg border-2 transition-all duration-200 overflow-hidden hover:shadow-lg"
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
          borderWidth: '2px'
        }}
      >
        {/* Folder Icon */}
        <div className="flex items-center justify-center p-3 aspect-square">
          <div className="relative">
            {/* Folder Base */}
            <div 
              className="w-12 h-10 rounded-lg shadow-md transform rotate-3 transition-transform group-hover:rotate-0"
              style={{ backgroundColor: folder.color }}
            >
              {/* Folder Tab */}
              <div 
                className="absolute -top-1.5 left-1.5 w-4 h-2 rounded-t-lg"
                style={{ backgroundColor: folder.color }}
              />
              
              {/* Folder Content Indicator */}
              <div className="absolute inset-2 bg-white bg-opacity-20 rounded"></div>
              
              {/* Shared indicator */}
              {folder.isShared && (
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.button.primary.background }}
                >
                  <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Folder Info */}
        <div 
          className="p-3 border-t"
          style={{ borderColor: theme.border.default }}
        >
          <h3 
            className="text-xs font-medium truncate mb-1"
            style={{ color: theme.text.primary }}
          >
            {folder.name}
          </h3>
          
          <div className="text-xs" style={{ color: theme.text.secondary }}>
            <div className="flex items-center justify-between">
              <span className="text-xs">Folder</span>
              {folder.isShared && (
                <span 
                  className="text-xs font-medium"
                  style={{ color: theme.button.primary.background }}
                >
                  Shared
                </span>
              )}
            </div>
            
            <div className="text-xs truncate">
              {new Date(folder.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - show on hover */}
      {(isHovered && folder.id !== 'root') && (
        <div 
          className="absolute top-1 right-1 rounded-lg shadow-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ 
            backgroundColor: theme.background.primary, 
            borderColor: theme.border.default,
            borderWidth: '1px'
          }}
        >
          <div className="flex gap-0.5">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 p-1"
              onClick={handleRenameClick}
              title="Rename folder"
            >
              <Pencil size={14} />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 p-1"
              onClick={handleDeleteClick}
              title="Delete folder"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
    </div>
  );
}