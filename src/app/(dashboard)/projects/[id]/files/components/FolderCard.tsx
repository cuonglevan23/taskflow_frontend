"use client";

import React, { useState } from 'react';
import { FileFolder } from '../context/ProjectFilesContext';
import { FileActions } from '../hooks/useProjectFileActions';

interface FolderCardProps {
  folder: FileFolder;
  actions: FileActions;
}

export function FolderCard({ folder, actions }: FolderCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 overflow-hidden">
        {/* Folder Icon */}
        <div className="flex items-center justify-center p-6 aspect-square">
          <div className="relative">
            {/* Folder Base */}
            <div 
              className="w-16 h-12 rounded-lg shadow-lg transform rotate-3 transition-transform group-hover:rotate-0"
              style={{ backgroundColor: folder.color }}
            >
              {/* Folder Tab */}
              <div 
                className="absolute -top-2 left-2 w-6 h-3 rounded-t-lg"
                style={{ backgroundColor: folder.color }}
              />
              
              {/* Folder Content Indicator */}
              <div className="absolute inset-2 bg-white bg-opacity-20 rounded"></div>
              
              {/* Shared indicator */}
              {folder.isShared && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Folder Info */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
            {folder.name}
          </h3>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Folder</span>
              {folder.isShared && (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  Shared
                </span>
              )}
            </div>
            
            <div className="text-xs">
              Created {new Date(folder.createdAt).toLocaleDateString()}
            </div>
            
            {folder.updatedAt !== folder.createdAt && (
              <div className="text-xs">
                Updated {new Date(folder.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons - show on hover */}
      {(isHovered && folder.id !== 'root') && (
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={handleRenameClick}
              className="p-1 text-gray-500 hover:text-orange-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Rename folder"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            
            <button
              onClick={handleDeleteClick}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Delete folder"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
    </div>
  );
}