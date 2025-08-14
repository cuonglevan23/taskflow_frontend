"use client";

import { useCallback } from 'react';
import { useProjectFiles, ProjectFile } from '../context/ProjectFilesContext';

export interface FileActions {
  onFileClick: (file: ProjectFile) => void;
  onFileDownload: (file: ProjectFile) => void;
  onFileShare: (file: ProjectFile) => void;
  onFileRename: (file: ProjectFile, newName: string) => void;
  onFileMove: (file: ProjectFile, targetFolderId: string) => void;
  onFileDelete: (file: ProjectFile) => void;
  onFilesUpload: (files: FileList, folderId?: string) => void;
  onBulkDelete: (fileIds: string[]) => void;
  onBulkMove: (fileIds: string[], targetFolderId: string) => void;
  onBulkShare: (fileIds: string[], userIds: string[]) => void;
  onFolderCreate: (name: string, parentId?: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderNavigate: (folderId: string | null) => void;
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
    moveFile,
    shareFile,
    bulkDeleteFiles,
    createFolder,
    deleteFolder,
    updateFolder,
    navigateToFolder,
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

  const handleFileMove = useCallback(async (file: ProjectFile, targetFolderId: string) => {
    await moveFile(file.id, targetFolderId);
  }, [moveFile]);

  const handleFileDelete = useCallback(async (file: ProjectFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      await deleteFile(file.id);
    }
  }, [deleteFile]);

  const handleFilesUpload = useCallback(async (files: FileList, folderId?: string) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      await uploadFile(file, folderId);
    }
  }, [uploadFile]);

  const handleBulkDelete = useCallback(async (fileIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${fileIds.length} files?`)) {
      await bulkDeleteFiles(fileIds);
    }
  }, [bulkDeleteFiles]);

  const handleBulkMove = useCallback(async (fileIds: string[], targetFolderId: string) => {
    // Move files one by one (in real app, you'd have bulk move API)
    for (const fileId of fileIds) {
      await moveFile(fileId, targetFolderId);
    }
  }, [moveFile]);

  const handleBulkShare = useCallback(async (fileIds: string[], userIds: string[]) => {
    // Share files one by one (in real app, you'd have bulk share API)
    for (const fileId of fileIds) {
      await shareFile(fileId, userIds);
    }
  }, [shareFile]);

  const handleFolderCreate = useCallback(async (name: string, parentId?: string) => {
    await createFolder(name, parentId);
  }, [createFolder]);

  const handleFolderRename = useCallback(async (folderId: string, newName: string) => {
    await updateFolder(folderId, { name: newName });
  }, [updateFolder]);

  const handleFolderDelete = useCallback(async (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? Files will be moved to parent folder.')) {
      await deleteFolder(folderId);
    }
  }, [deleteFolder]);

  const handleFolderNavigate = useCallback((folderId: string | null) => {
    navigateToFolder(folderId);
  }, [navigateToFolder]);

  return {
    onFileClick: handleFileClick,
    onFileDownload: handleFileDownload,
    onFileShare: handleFileShare,
    onFileRename: handleFileRename,
    onFileMove: handleFileMove,
    onFileDelete: handleFileDelete,
    onFilesUpload: handleFilesUpload,
    onBulkDelete: handleBulkDelete,
    onBulkMove: handleBulkMove,
    onBulkShare: handleBulkShare,
    onFolderCreate: handleFolderCreate,
    onFolderRename: handleFolderRename,
    onFolderDelete: handleFolderDelete,
    onFolderNavigate: handleFolderNavigate,
  };
}