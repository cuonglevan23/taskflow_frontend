"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProject } from '../../components/DynamicProjectProvider';

export interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  url: string;
  thumbnail?: string;
  tags: string[];
  description?: string;
  version: number;
  isShared: boolean;
  sharedWith: string[];
  folder: string;
}

export interface FileFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  color: string;
  isShared: boolean;
}

interface ProjectFilesContextValue {
  files: ProjectFile[];
  folders: FileFolder[];
  currentFolder: FileFolder | null;
  loading: boolean;
  error: string | null;
  
  // File operations
  uploadFile: (file: File, folderId?: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => Promise<void>;
  moveFile: (fileId: string, targetFolderId: string) => Promise<void>;
  shareFile: (fileId: string, userIds: string[]) => Promise<void>;
  bulkDeleteFiles: (fileIds: string[]) => Promise<void>;
  
  // Folder operations
  createFolder: (name: string, parentId?: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  updateFolder: (folderId: string, updates: Partial<FileFolder>) => Promise<void>;
  navigateToFolder: (folderId: string | null) => void;
  
  // File selection and preview
  selectedFiles: string[];
  setSelectedFiles: (fileIds: string[]) => void;
  selectedFile: ProjectFile | null;
  previewFile: (file: ProjectFile) => void;
  closePreview: () => void;
  
  // Project context
  projectId: string;
  projectName: string;
}

const ProjectFilesContext = createContext<ProjectFilesContextValue | undefined>(undefined);

interface ProjectFilesProviderProps {
  children: ReactNode;
}

// Mock files data - in real app, this would come from API based on projectId
const generateMockFiles = (projectId: string, projectName: string): ProjectFile[] => [
  {
    id: `${projectId}-file-demo-image`,
    name: `${projectName}_Demo_Screenshot.png`,
    size: 1245680,
    type: 'png',
    mimeType: 'image/png',
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: 'van.le',
      name: 'Van Le',
      avatar: 'VL'
    },
    url: '/demo.png',
    tags: ['screenshot', 'demo', 'ui'],
    description: 'Demo screenshot showing project interface',
    version: 1,
    isShared: true,
    sharedWith: ['sarah.wilson', 'john.doe'],
    folder: 'root'
  },
  {
    id: `${projectId}-file-1`,
    name: `${projectName}_Design_Specs.pdf`,
    size: 2547823,
    type: 'pdf',
    mimeType: 'application/pdf',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: 'sarah.wilson',
      name: 'Sarah Wilson',
      avatar: 'SW'
    },
    url: `/files/${projectId}/design_specs.pdf`,
    tags: ['design', 'specification', 'ui'],
    description: 'Design specifications and wireframes for the project',
    version: 1,
    isShared: true,
    sharedWith: ['john.doe', 'mike.chen'],
    folder: 'root'
  },
  {
    id: `${projectId}-file-demo-image-2`,
    name: `${projectName}_Feature_Preview.png`,
    size: 892341,
    type: 'png',
    mimeType: 'image/png',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: 'john.doe',
      name: 'John Doe', 
      avatar: 'JD'
    },
    url: '/demo.png', // Reusing same demo image
    tags: ['preview', 'feature', 'ui'],
    description: 'Preview of new feature implementation',
    version: 1,
    isShared: true,
    sharedWith: ['sarah.wilson'],
    folder: 'assets'
  },
  {
    id: `${projectId}-file-demo-image-3`,
    name: `${projectName}_Logo_Concept.png`,
    size: 567234,
    type: 'png',
    mimeType: 'image/png',
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: 'emma.davis',
      name: 'Emma Davis',
      avatar: 'ED'
    },
    url: '/demo.png', // Reusing same demo image
    tags: ['logo', 'design', 'branding'],
    description: 'Initial logo concept and branding ideas',
    version: 2,
    isShared: false,
    sharedWith: [],
    folder: 'assets'
  },
  {
    id: `${projectId}-file-2`,
    name: `${projectName}_API_Documentation.md`,
    size: 156432,
    type: 'markdown',
    mimeType: 'text/markdown',
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: 'john.doe',
      name: 'John Doe',
      avatar: 'JD'
    },
    url: `/files/${projectId}/api_docs.md`,
    tags: ['documentation', 'api', 'backend'],
    description: 'Complete API documentation with examples',
    version: 3,
    isShared: false,
    sharedWith: [],
    folder: 'docs'
  },
  {
    id: `${projectId}-file-3`,
    name: `${projectName}_Screenshots.zip`,
    size: 8934521,
    type: 'archive',
    mimeType: 'application/zip',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: 'emma.davis',
      name: 'Emma Davis',
      avatar: 'ED'
    },
    url: `/files/${projectId}/screenshots.zip`,
    tags: ['screenshots', 'testing', 'ui'],
    description: 'UI screenshots for testing and documentation',
    version: 1,
    isShared: true,
    sharedWith: ['sarah.wilson', 'alex.taylor'],
    folder: 'assets'
  },
  {
    id: `${projectId}-file-4`,
    name: `${projectName}_Database_Schema.sql`,
    size: 23456,
    type: 'sql',
    mimeType: 'application/sql',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: 'mike.chen',
      name: 'Mike Chen',
      avatar: 'MC'
    },
    url: `/files/${projectId}/schema.sql`,
    tags: ['database', 'schema', 'backend'],
    description: 'Database schema and initial data setup',
    version: 2,
    isShared: true,
    sharedWith: ['john.doe'],
    folder: 'database'
  }
];

const generateMockFolders = (projectId: string): FileFolder[] => [
  {
    id: 'root',
    name: 'Root',
    parentId: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#6B7280',
    isShared: false
  },
  {
    id: 'docs',
    name: 'Documentation',
    parentId: 'root',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#3B82F6',
    isShared: true
  },
  {
    id: 'assets',
    name: 'Assets',
    parentId: 'root',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#10B981',
    isShared: true
  },
  {
    id: 'database',
    name: 'Database',
    parentId: 'root',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#F59E0B',
    isShared: false
  }
];

export function ProjectFilesProvider({ children }: ProjectFilesProviderProps) {
  const { project, loading: projectLoading } = useProject();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FileFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  // Load files when project changes
  useEffect(() => {
    const loadProjectFiles = async () => {
      if (!project) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // In real app, this would be API calls
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        const mockFiles = generateMockFiles(project.id, project.name);
        const mockFolders = generateMockFolders(project.id);
        
        setFiles(mockFiles);
        setFolders(mockFolders);
        setCurrentFolder(mockFolders.find(f => f.id === 'root') || null);
        
      } catch (err) {
        setError('Failed to load project files');
        console.error('Error loading project files:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjectFiles();
  }, [project]);

  // File operations
  const uploadFile = async (file: File, folderId: string = 'root') => {
    if (!project) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      
      const newFile: ProjectFile = {
        id: `${project.id}-file-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop() || 'unknown',
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: {
          id: 'current-user',
          name: 'Current User',
          avatar: 'CU'
        },
        url: `/files/${project.id}/${file.name}`,
        tags: [],
        version: 1,
        isShared: false,
        sharedWith: [],
        folder: folderId
      };
      
      setFiles(prev => [newFile, ...prev]);
      
    } catch (err) {
      setError('Failed to upload file');
      console.error('Error uploading file:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setFiles(prev => prev.filter(file => file.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
      
    } catch (err) {
      setError('Failed to delete file');
      console.error('Error deleting file:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFile = async (fileId: string, updates: Partial<ProjectFile>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, ...updates, updatedAt: new Date().toISOString() }
          : file
      ));
      
      if (selectedFile?.id === fileId) {
        setSelectedFile(prev => prev ? { ...prev, ...updates } : null);
      }
      
    } catch (err) {
      setError('Failed to update file');
      console.error('Error updating file:', err);
    } finally {
      setLoading(false);
    }
  };

  const moveFile = async (fileId: string, targetFolderId: string) => {
    await updateFile(fileId, { folder: targetFolderId });
  };

  const shareFile = async (fileId: string, userIds: string[]) => {
    await updateFile(fileId, { isShared: userIds.length > 0, sharedWith: userIds });
  };

  const bulkDeleteFiles = async (fileIds: string[]) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
      setSelectedFiles([]);
      
    } catch (err) {
      setError('Failed to delete files');
      console.error('Error deleting files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Folder operations
  const createFolder = async (name: string, parentId: string = 'root') => {
    if (!project) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newFolder: FileFolder = {
        id: `folder-${Date.now()}`,
        name,
        parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: '#6B7280',
        isShared: false
      };
      
      setFolders(prev => [...prev, newFolder]);
      
    } catch (err) {
      setError('Failed to create folder');
      console.error('Error creating folder:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (folderId === 'root') return; // Cannot delete root folder
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Move files in this folder to parent
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        const filesToMove = files.filter(f => f.folder === folderId);
        const parentFolderId = folder.parentId || 'root';
        
        setFiles(prev => prev.map(file => 
          file.folder === folderId 
            ? { ...file, folder: parentFolderId }
            : file
        ));
      }
      
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      
      // Navigate to parent if current folder was deleted
      if (currentFolder?.id === folderId) {
        const parentFolder = folders.find(f => f.id === currentFolder.parentId) || 
                            folders.find(f => f.id === 'root');
        setCurrentFolder(parentFolder || null);
      }
      
    } catch (err) {
      setError('Failed to delete folder');
      console.error('Error deleting folder:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFolder = async (folderId: string, updates: Partial<FileFolder>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setFolders(prev => prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, ...updates, updatedAt: new Date().toISOString() }
          : folder
      ));
      
      if (currentFolder?.id === folderId) {
        setCurrentFolder(prev => prev ? { ...prev, ...updates } : null);
      }
      
    } catch (err) {
      setError('Failed to update folder');
      console.error('Error updating folder:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderId: string | null) => {
    const folder = folderId ? folders.find(f => f.id === folderId) : folders.find(f => f.id === 'root');
    setCurrentFolder(folder || null);
    setSelectedFiles([]);
  };

  // File preview
  const previewFile = (file: ProjectFile) => {
    setSelectedFile(file);
  };

  const closePreview = () => {
    setSelectedFile(null);
  };

  const contextValue: ProjectFilesContextValue = {
    files,
    folders,
    currentFolder,
    loading: loading || projectLoading,
    error,
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
    selectedFiles,
    setSelectedFiles,
    selectedFile,
    previewFile,
    closePreview,
    projectId: project?.id || '',
    projectName: project?.name || '',
  };

  return (
    <ProjectFilesContext.Provider value={contextValue}>
      {children}
    </ProjectFilesContext.Provider>
  );
}

export function useProjectFiles() {
  const context = useContext(ProjectFilesContext);
  if (context === undefined) {
    throw new Error('useProjectFiles must be used within a ProjectFilesProvider');
  }
  return context;
}