"use client";

import { useCallback } from 'react';
import { useProjectFiles, ProjectFile } from '../context/ProjectFilesContext';

export interface FileActions {
  onFileClick: (file: ProjectFile) => void;
  onFileDownload: (file: ProjectFile) => void;
  onFileShare: (file: ProjectFile) => void;
  onFileRename: (file: ProjectFile, newName: string) => void;
  onFileDelete: (file: ProjectFile) => void;
  onFilesUpload: (files: FileList) => void;
  onBulkDelete: (fileIds: string[]) => void;
  onBulkShare: (fileIds: string[], userIds: string[]) => void;
}

/**
 * Custom hook providing file management actions for projects files
 * Integrates with ProjectFilesContext for projects-specific operations
 */
export function useProjectFileActions(): FileActions {
  const {
    uploadFile,
    deleteFile,
    updateFile,
    shareFile,
    bulkDeleteFiles,
    previewFile,
  } = useProjectFiles();

  const handleFileClick = useCallback((file: ProjectFile) => {
    previewFile(file);
  }, [previewFile]);

  const handleFileDownload = useCallback((file: ProjectFile) => {
    // In real app, this would trigger file download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  }, []);

  const handleFileShare = useCallback(async (file: ProjectFile) => {
    // In real app, this would open share dialog
    const userIds = ['john.doe', 'sarah.wilson']; // Mock shared users
    await shareFile(file.id, userIds);
  }, [shareFile]);

  const handleFileRename = useCallback(async (file: ProjectFile, newName: string) => {
    await updateFile(file.id, { name: newName });
  }, [updateFile]);

  const handleFileDelete = useCallback(async (file: ProjectFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      await deleteFile(file.id);
    }
  }, [deleteFile]);

  const handleFilesUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      await uploadFile(file, 'root');
    }
  }, [uploadFile]);

  const handleBulkDelete = useCallback(async (fileIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${fileIds.length} files?`)) {
      await bulkDeleteFiles(fileIds);
    }
  }, [bulkDeleteFiles]);

  const handleBulkShare = useCallback(async (fileIds: string[], userIds: string[]) => {
    // Share files one by one (in real app, you'd have bulk share API)
    for (const fileId of fileIds) {
      await shareFile(fileId, userIds);
    }
  }, [shareFile]);

  return {
    onFileClick: handleFileClick,
    onFileDownload: handleFileDownload,
    onFileShare: handleFileShare,
    onFileRename: handleFileRename,
    onFileDelete: handleFileDelete,
    onFilesUpload: handleFilesUpload,
    onBulkDelete: handleBulkDelete,
    onBulkShare: handleBulkShare,
  };
}