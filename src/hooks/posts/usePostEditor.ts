import { useState, useCallback } from 'react';
import { UpdatePostData } from '@/types/post';
import {
  optimizeImageForUpload,
  validateImageFile
} from '@/utils/imageCompression';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalFile?: File;
  compressionStats?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: string;
  };
}

interface EditPostState {
  content: string;
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  isPinned: boolean;
  linkedTaskId?: number;
  linkedProjectId?: number;
  images: ImageFile[];
  files: File[];
  removeImageIds: number[];
  removeFileIds: number[];
}

export function usePostEditor(initialData?: {
  content: string;
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  isPinned: boolean;
  linkedTaskId?: number;
  linkedProjectId?: number;
  existingImages?: Array<{ id: number; url: string }>;
  existingFiles?: Array<{ id: number; name: string; url: string }>;
}) {
  const [editState, setEditState] = useState<EditPostState>({
    content: initialData?.content || '',
    privacy: initialData?.privacy || 'PUBLIC',
    isPinned: initialData?.isPinned || false,
    linkedTaskId: initialData?.linkedTaskId,
    linkedProjectId: initialData?.linkedProjectId,
    images: [],
    files: [],
    removeImageIds: [],
    removeFileIds: [],
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update content
  const updateContent = useCallback((content: string) => {
    setEditState(prev => ({ ...prev, content }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  }, [errors.content]);

  // Update privacy
  const updatePrivacy = useCallback((privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') => {
    setEditState(prev => ({ ...prev, privacy }));
  }, []);

  // Toggle pinned status
  const togglePinned = useCallback(() => {
    setEditState(prev => ({ ...prev, isPinned: !prev.isPinned }));
  }, []);

  // Add new images
  const addImages = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    const newImages: ImageFile[] = [];

    try {
      for (const file of files) {
        // Basic file validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

        if (!allowedTypes.includes(file.type)) {
          setErrors(prev => ({ ...prev, images: 'Chỉ hỗ trợ file ảnh (JPEG, PNG, WebP, GIF)' }));
          continue;
        }

        if (file.size > maxSize) {
          setErrors(prev => ({ ...prev, images: 'Kích thước ảnh không được vượt quá 10MB' }));
          continue;
        }

        // Optimize image
        const originalSize = file.size;
        const optimizedFile = await optimizeImageForUpload(file, 'post');
        const preview = URL.createObjectURL(optimizedFile);

        // Calculate compression stats
        const compressionRatio = originalSize > 0 ? ((originalSize - optimizedFile.size) / originalSize * 100).toFixed(1) : '0';

        newImages.push({
          id: `new-${Date.now()}-${Math.random()}`,
          file: optimizedFile,
          preview,
          originalFile: file,
          compressionStats: {
            originalSize,
            compressedSize: optimizedFile.size,
            compressionRatio: `${compressionRatio}%`,
          },
        });
      }

      setEditState(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, images: 'Failed to process images' }));
    } finally {
      setIsProcessing(false);
    }
  }, [errors.images]);

  // Remove new image
  const removeImage = useCallback((imageId: string) => {
    setEditState(prev => {
      const imageToRemove = prev.images.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return {
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      };
    });
  }, []);

  // Mark existing image for removal
  const markImageForRemoval = useCallback((imageId: number) => {
    setEditState(prev => ({
      ...prev,
      removeImageIds: [...prev.removeImageIds, imageId]
    }));
  }, []);

  // Unmark existing image for removal
  const unmarkImageForRemoval = useCallback((imageId: number) => {
    setEditState(prev => ({
      ...prev,
      removeImageIds: prev.removeImageIds.filter(id => id !== imageId)
    }));
  }, []);

  // Add files
  const addFiles = useCallback((files: File[]) => {
    setEditState(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  }, []);

  // Remove new file
  const removeFile = useCallback((fileIndex: number) => {
    setEditState(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== fileIndex)
    }));
  }, []);

  // Mark existing file for removal
  const markFileForRemoval = useCallback((fileId: number) => {
    setEditState(prev => ({
      ...prev,
      removeFileIds: [...prev.removeFileIds, fileId]
    }));
  }, []);

  // Unmark existing file for removal
  const unmarkFileForRemoval = useCallback((fileId: number) => {
    setEditState(prev => ({
      ...prev,
      removeFileIds: prev.removeFileIds.filter(id => id !== fileId)
    }));
  }, []);

  // Update linked task
  const updateLinkedTask = useCallback((taskId?: number) => {
    setEditState(prev => ({ ...prev, linkedTaskId: taskId }));
  }, []);

  // Update linked project
  const updateLinkedProject = useCallback((projectId?: number) => {
    setEditState(prev => ({ ...prev, linkedProjectId: projectId }));
  }, []);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editState.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editState.content]);

  // Get update data for API
  const getUpdateData = useCallback((): UpdatePostData => {
    const updateData: UpdatePostData = {
      content: editState.content.trim(),
      privacy: editState.privacy,
      isPinned: editState.isPinned,
    };

    // Add optional fields only if they have values
    if (editState.linkedTaskId !== undefined) {
      updateData.linkedTaskId = editState.linkedTaskId;
    }

    if (editState.linkedProjectId !== undefined) {
      updateData.linkedProjectId = editState.linkedProjectId;
    }

    if (editState.images.length > 0) {
      updateData.images = editState.images.map(img => img.file);
    }

    if (editState.files.length > 0) {
      updateData.files = editState.files;
    }

    if (editState.removeImageIds.length > 0) {
      updateData.removeImageIds = editState.removeImageIds;
    }

    if (editState.removeFileIds.length > 0) {
      updateData.removeFileIds = editState.removeFileIds;
    }

    return updateData;
  }, [editState]);

  // Reset form
  const reset = useCallback(() => {
    // Clean up image previews
    editState.images.forEach(img => {
      URL.revokeObjectURL(img.preview);
    });

    setEditState({
      content: initialData?.content || '',
      privacy: initialData?.privacy || 'PUBLIC',
      isPinned: initialData?.isPinned || false,
      linkedTaskId: initialData?.linkedTaskId,
      linkedProjectId: initialData?.linkedProjectId,
      images: [],
      files: [],
      removeImageIds: [],
      removeFileIds: [],
    });
    setErrors({});
  }, [initialData, editState.images]);

  // Check if form has changes
  const hasChanges = useCallback((): boolean => {
    return (
      editState.content !== (initialData?.content || '') ||
      editState.privacy !== (initialData?.privacy || 'PUBLIC') ||
      editState.isPinned !== (initialData?.isPinned || false) ||
      editState.linkedTaskId !== initialData?.linkedTaskId ||
      editState.linkedProjectId !== initialData?.linkedProjectId ||
      editState.images.length > 0 ||
      editState.files.length > 0 ||
      editState.removeImageIds.length > 0 ||
      editState.removeFileIds.length > 0
    );
  }, [editState, initialData]);

  return {
    // State
    editState,
    isProcessing,
    errors,

    // Content management
    updateContent,
    updatePrivacy,
    togglePinned,

    // Media management
    addImages,
    removeImage,
    markImageForRemoval,
    unmarkImageForRemoval,
    addFiles,
    removeFile,
    markFileForRemoval,
    unmarkFileForRemoval,

    // Link management
    updateLinkedTask,
    updateLinkedProject,

    // Form management
    validate,
    getUpdateData,
    reset,
    hasChanges,
  };
}
