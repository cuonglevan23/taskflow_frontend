// Export all file management components, hooks, and context
export { ProjectFilesProvider, useProjectFiles } from './context/ProjectFilesContext';
export type { ProjectFile, FileFolder } from './context/ProjectFilesContext';
export { useProjectFileActions } from './hooks/useProjectFileActions';
export type { FileActions } from './hooks/useProjectFileActions';
export { FileGrid } from './components/FileGrid';
export { FileCard } from './components/FileCard';
export { FolderCard } from './components/FolderCard';
export { FileIcon } from './components/FileIcon';
export { FilePreview } from './components/FilePreview';

// Re-export the main page component
export { default as ProjectFilesPage } from './page';