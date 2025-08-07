"use client";

import React from 'react';
import { ProjectFile, FileFolder } from '../context/ProjectFilesContext';
import { FileActions } from '../hooks/useProjectFileActions';
import { FileCard } from './FileCard';
import { FolderCard } from './FolderCard';
import { BulkActions, SelectAllControl } from '@/components/ui/Button';

interface FileGridProps {
  files: ProjectFile[];
  folders: FileFolder[];
  currentFolderId: string | null;
  selectedFiles: string[];
  onSelectionChange: (fileIds: string[]) => void;
  actions: FileActions;
  loading?: boolean;
}

export function FileGrid({
  files,
  folders,
  currentFolderId,
  selectedFiles,
  onSelectionChange,
  actions,
  loading = false
}: FileGridProps) {
  // Filter files and folders for current directory
  const currentFiles = files.filter(file => file.folder === (currentFolderId || 'root'));
  const currentFolders = folders.filter(folder => folder.parentId === currentFolderId);

  const handleFileSelect = (fileId: string) => {
    const isSelected = selectedFiles.includes(fileId);
    if (isSelected) {
      onSelectionChange(selectedFiles.filter(id => id !== fileId));
    } else {
      onSelectionChange([...selectedFiles, fileId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === currentFiles.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(currentFiles.map(file => file.id));
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square mb-2 flex items-center justify-center">
              <img 
                src="/images/placeholders/loading-image.svg" 
                alt="Loading..." 
                className="w-16 h-16 opacity-50"
              />
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-1"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Bulk actions */}
      <BulkActions
        selectedCount={selectedFiles.length}
        onShare={() => actions.onBulkShare(selectedFiles, [])}
        onDelete={() => actions.onBulkDelete(selectedFiles)}
        onClear={() => onSelectionChange([])}
        onMove={() => {
          // TODO: Implement bulk move functionality
          console.log('Bulk move files:', selectedFiles);
        }}
      />

      {/* Select all control */}
      {currentFiles.length > 0 && (
        <div className="mb-4">
          <SelectAllControl
            totalCount={currentFiles.length}
            selectedCount={selectedFiles.length}
            onSelectAll={handleSelectAll}
            onClearSelection={() => onSelectionChange([])}
          />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Folders */}
        {currentFolders.map(folder => (
          <FolderCard
            key={folder.id}
            folder={folder}
            actions={actions}
          />
        ))}

        {/* Files */}
        {currentFiles.map(file => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={selectedFiles.includes(file.id)}
            onSelect={handleFileSelect}
            actions={actions}
          />
        ))}
      </div>

      {/* Empty state */}
      {currentFiles.length === 0 && currentFolders.length === 0 && (
        <div className="col-span-full text-center py-12">
          <img 
            src="/images/placeholders/no-files.svg" 
            alt="No files" 
            className="w-48 h-32 mx-auto mb-6 opacity-60"
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No files yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Upload files or create folders to get started.
          </p>
        </div>
      )}
    </div>
  );
}