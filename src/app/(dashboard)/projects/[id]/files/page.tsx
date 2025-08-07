"use client";

import React, { useRef } from 'react';
import { FileGrid } from './components/FileGrid';
import { FilePreview } from './components/FilePreview';
import { ProjectFilesProvider, useProjectFiles } from './context/ProjectFilesContext';
import { useProjectFileActions } from './hooks/useProjectFileActions';
import { useTheme } from '@/layouts/hooks/useTheme';
import { Button } from '@/components/ui';

interface ProjectFilesPageProps {
  searchValue?: string;
}

function ProjectFilesContent({ searchValue = "" }: ProjectFilesPageProps) {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    files,
    folders,
    currentFolder,
    loading,
    error,
    selectedFiles,
    setSelectedFiles,
    selectedFile,
    closePreview,
    projectName
  } = useProjectFiles();
  
  const actions = useProjectFileActions();

  // Filter files based on search
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    file.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      actions.onFilesUpload(files, currentFolder?.id);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name && name.trim()) {
      actions.onFolderCreate(name.trim(), currentFolder?.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      actions.onFilesUpload(files, currentFolder?.id);
    }
  };

  // Breadcrumb navigation
  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    let current = currentFolder;
    
    while (current) {
      breadcrumbs.unshift(current);
      current = current.parentId ? folders.find(f => f.id === current.parentId) : null;
    }
    
    return breadcrumbs;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            {error}
          </div>
          <p className="text-gray-600">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full relative"
      style={{ backgroundColor: theme.background.secondary }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {projectName} Files
            </h1>
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 mt-2">
              <Button
                variant="ghost-colored"
                size="xs"
                onClick={() => actions.onFolderNavigate(null)}
                leftIcon={<span>📁</span>}
              >
                Root
              </Button>
              {getBreadcrumbs().map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <span className="text-gray-400 dark:text-gray-600">/</span>
                  <Button
                    variant="ghost-colored"
                    size="xs"
                    onClick={() => actions.onFolderNavigate(folder.id)}
                  >
                    {folder.name}
                  </Button>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateFolder}
              leftIcon={<span>📁</span>}
            >
              New Folder
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleFileUpload}
              leftIcon={<span>📤</span>}
            >
              Upload Files
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{folders.filter(f => f.parentId === currentFolder?.id).length} folders</span>
          <span>{files.filter(f => f.folder === (currentFolder?.id || 'root')).length} files</span>
          {selectedFiles.length > 0 && (
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              {selectedFiles.length} selected
            </span>
          )}
        </div>
      </div>

      {/* File grid */}
      <div className="flex-1 overflow-auto">
        <FileGrid
          files={filteredFiles}
          folders={folders}
          currentFolderId={currentFolder?.id || null}
          selectedFiles={selectedFiles}
          onSelectionChange={setSelectedFiles}
          actions={actions}
          loading={loading}
        />
      </div>

      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* File preview */}
      <FilePreview
        file={selectedFile}
        isOpen={!!selectedFile}
        onClose={closePreview}
        actions={actions}
      />

      {/* Drop overlay */}
      <div className="fixed inset-0 bg-orange-500 bg-opacity-20 border-4 border-dashed border-orange-400 rounded-lg pointer-events-none opacity-0 transition-opacity duration-200" />
    </div>
  );
}

export default function ProjectFilesPage({ searchValue }: ProjectFilesPageProps) {
  return (
    <ProjectFilesProvider>
      <ProjectFilesContent searchValue={searchValue} />
    </ProjectFilesProvider>
  );
}