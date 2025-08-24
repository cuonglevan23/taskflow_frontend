"use client";

import React, { useRef } from 'react';
import { FileGrid } from './components/FileGrid';
import { FilePreview } from './components/FilePreview';
import { ProjectFilesProvider, useProjectFiles } from './context/ProjectFilesContext';
import { useProjectFileActions } from './hooks/useProjectFileActions';
import { useTheme } from '@/layouts/hooks/useTheme';
import { Button } from '@/components/ui';
import { Upload } from 'lucide-react';

interface ProjectFilesPageProps {
  searchValue?: string;
}

function ProjectFilesContent({ searchValue = "" }: ProjectFilesPageProps) {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    files,
    loading,
    error,
    selectedFile,
    closePreview
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
    const fileList = event.target.files;
    if (!fileList) return;
    
    if (fileList.length > 0) {
      actions.onFilesUpload(fileList);
    }
    
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Add style to show drop zone
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const { files } = event.dataTransfer;
    if (files && files.length > 0) {
      actions.onFilesUpload(files);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
        <div className="text-lg font-medium mb-2" style={{ color: theme.button.primary.background }}>
          Error Loading Files
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button 
          variant="default"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="h-full w-full flex flex-col"
      style={{ backgroundColor: theme.background.secondary }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div 
        className="border-b p-4"
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleFileUpload}
                className="flex items-center gap-1.5"
              >
                <Upload size={16} />
                <span>Upload Files</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm" style={{ color: theme.text.secondary }}>
          <span>{files.length} files</span>
        </div>
      </div>

      {/* File grid */}
      <div className="flex-1 overflow-auto w-full p-6">
        <FileGrid
          files={filteredFiles}
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
      <div 
        className="fixed inset-0 bg-opacity-20 border-4 border-dashed rounded-lg pointer-events-none opacity-0 transition-opacity duration-200 bg-blue-400 dark:bg-blue-500 border-blue-500 dark:border-blue-600" 
      />
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