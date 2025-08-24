"use client";

import React from 'react';
import { ProjectFile } from '../context/ProjectFilesContext';
import { FileActions } from '../hooks/useProjectFileActions';
import { FileCard } from './FileCard';
import { Button } from '@/components/ui';
import Image from 'next/image';

interface FileGridProps {
  files: ProjectFile[];
  actions: FileActions;
  loading?: boolean;
}

export function FileGrid({
  files,
  actions,
  loading = false
}: FileGridProps) {

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse mb-3">
            <Image 
              src="/images/placeholders/loading-image.svg" 
              alt="Loading..." 
              width={40}
              height={40}
              className="opacity-50"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">{
        files.map(file => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={false}
            onSelect={() => {}}
            actions={actions}
          />
        ))}
      </div>

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-16 w-full">
          <div className="mb-6">
            <Image 
              src="/images/placeholders/no-files.svg" 
              alt="No files" 
              width={192}
              height={128}
              className="mx-auto opacity-60"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No files yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Upload your first file to get started with file management.
          </p>
          <Button
            variant="default"
                            onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.multiple = true;
                  fileInput.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) actions.onFilesUpload(files);
                  };
                  fileInput.click();
                }}
          >
            Upload Files
          </Button>
        </div>
      )}
    </div>
  );
}