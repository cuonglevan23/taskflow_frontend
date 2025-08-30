// Modern File Upload Component with Card UI
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Upload,
  X,
  Download,
  Eye,
  FileText,
  FileImage,
  FileVideo,
  File as FileIcon,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileCardUploadProps {
  taskId: number;
  onUploadComplete?: (fileInfo: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  maxFileSize?: number;
  acceptedTypes?: string[];
}

interface FileItem {
  id: string;
  file: File;
  preview?: string;
  uploadProgress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

const FILE_ICONS = {
  image: FileImage,
  video: FileVideo,
  document: FileText,
  default: FileIcon,
};

const getFileType = (fileName: string): keyof typeof FILE_ICONS => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext || '')) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) return 'video';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '')) return 'document';
  return 'default';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileCardUpload: React.FC<FileCardUploadProps> = ({
  taskId,
  onUploadComplete,
  onUploadError,
  className = '',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.mp4', '.avi', '.mov']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileItems, setFileItems] = useState<FileItem[]>([]);

  const {
    isUploading,
    uploadSingleFile,
    attachments,
    getAttachments,
    deleteAttachment,
    downloadFile,
    previewFile
  } = useFileUpload();

  // Load existing attachments
  useEffect(() => {
    const loadAttachments = async () => {
      try {
        await getAttachments(taskId);
      } catch (error) {
        console.error('Failed to load attachments:', error);
      }
    };
    loadAttachments();
  }, [taskId, getAttachments]);

  // Create file preview for images
  const createFilePreview = async (file: File): Promise<string | undefined> => {
    if (getFileType(file.name) === 'image') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File quá lớn. Kích thước tối đa: ${formatFileSize(maxFileSize)}`;
    }

    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExt)) {
      return `Loại file không được hỗ trợ. Chỉ chấp nhận: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList) => {
    const newFileItems: FileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);

      if (error) {
        onUploadError?.(error);
        continue;
      }

      const preview = await createFilePreview(file);
      const fileItem: FileItem = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview,
        status: 'pending'
      };

      newFileItems.push(fileItem);
    }

    setFileItems(prev => [...prev, ...newFileItems]);
  };

  // Upload single file
  const handleUploadFile = async (fileItem: FileItem) => {
    setFileItems(prev => prev.map(item =>
      item.id === fileItem.id
        ? { ...item, status: 'uploading', uploadProgress: 0 }
        : item
    ));

    try {
      const result = await uploadSingleFile(fileItem.file, taskId, {
        method: 'presigned',
        onProgress: (progress) => {
          setFileItems(prev => prev.map(item =>
            item.id === fileItem.id
              ? { ...item, uploadProgress: progress }
              : item
          ));
        }
      });

      setFileItems(prev => prev.map(item =>
        item.id === fileItem.id
          ? { ...item, status: 'completed' }
          : item
      ));

      // Refresh attachments
      await getAttachments(taskId);
      onUploadComplete?.(result);

      // Remove completed file from pending list after delay
      setTimeout(() => {
        setFileItems(prev => prev.filter(item => item.id !== fileItem.id));
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFileItems(prev => prev.map(item =>
        item.id === fileItem.id
          ? { ...item, status: 'error', errorMessage }
          : item
      ));
      onUploadError?.(errorMessage);
    }
  };

  // Remove file from pending list
  const handleRemoveFile = (fileId: string) => {
    setFileItems(prev => prev.filter(item => item.id !== fileId));
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
    // Reset input value
    e.target.value = '';
  };

  // Handle delete attachment
  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachment(taskId, attachmentId);
      await getAttachments(taskId);
    } catch (error) {
      onUploadError?.('Failed to delete file');
    }
  };

  // Handle download
  const handleDownload = async (fileKey: string, fileName: string) => {
    try {
      await downloadFile(fileKey, fileName);
    } catch (error) {
      onUploadError?.('Failed to download file');
    }
  };

  // Handle preview
  const handlePreview = async (fileKey: string) => {
    try {
      const url = await previewFile(fileKey);
      window.open(url, '_blank');
    } catch (error) {
      onUploadError?.('Failed to preview file');
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
          dragActive
            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          accept={acceptedTypes.join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Kéo thả file vào đây
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              hoặc nhấp để chọn file
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Chọn File
            </Button>
            <p className="text-xs text-gray-400">
              Kích thước tối đa: {formatFileSize(maxFileSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Files */}
      {fileItems.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Đang chờ upload ({fileItems.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fileItems.map((fileItem) => (
              <FileCard
                key={fileItem.id}
                fileItem={fileItem}
                onUpload={handleUploadFile}
                onRemove={handleRemoveFile}
                isPending
              />
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {attachments.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            File đã upload ({attachments.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                onDelete={handleDeleteAttachment}
                onDownload={handleDownload}
                onPreview={handlePreview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// FileCard Component for pending uploads
interface FileCardProps {
  fileItem: FileItem;
  onUpload: (fileItem: FileItem) => void;
  onRemove: (fileId: string) => void;
  isPending?: boolean;
}

const FileCard: React.FC<FileCardProps> = ({ fileItem, onUpload, onRemove, isPending }) => {
  const fileType = getFileType(fileItem.file.name);
  const IconComponent = FILE_ICONS[fileType];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Preview Area */}
      <div className="aspect-video bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative">
        {fileItem.preview ? (
          <img
            src={fileItem.preview}
            alt={fileItem.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <IconComponent className="w-12 h-12 text-gray-400" />
        )}

        {/* Status Overlay */}
        {fileItem.status === 'uploading' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-2 min-w-24">
              <Progress value={fileItem.uploadProgress || 0} className="h-2" />
              <p className="text-xs text-center mt-1">{fileItem.uploadProgress || 0}%</p>
            </div>
          </div>
        )}

        {fileItem.status === 'completed' && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
          </div>
        )}

        {fileItem.status === 'error' && (
          <div className="absolute top-2 right-2">
            <AlertCircle className="w-6 h-6 text-red-500 bg-white rounded-full" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="p-4">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
          {fileItem.file.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {formatFileSize(fileItem.file.size)}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {fileItem.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onUpload(fileItem)}
                className="flex-1"
              >
                Upload
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemove(fileItem.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}

          {fileItem.status === 'error' && (
            <div className="w-full">
              <p className="text-xs text-red-500 mb-2">{fileItem.errorMessage}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onUpload(fileItem)}
                  className="flex-1"
                >
                  Thử lại
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemove(fileItem.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// AttachmentCard Component for uploaded files
interface AttachmentCardProps {
  attachment: any;
  onDelete: (id: number) => void;
  onDownload: (fileKey: string, fileName: string) => void;
  onPreview: (fileKey: string) => void;
}

const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  onDelete,
  onDownload,
  onPreview
}) => {
  const fileType = getFileType(attachment.originalFilename);
  const IconComponent = FILE_ICONS[fileType];
  const isImage = fileType === 'image';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Preview Area */}
      <div className="aspect-video bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative group">
        {isImage && attachment.downloadUrl ? (
          <img
            src={attachment.downloadUrl}
            alt={attachment.originalFilename}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : (
          <IconComponent className="w-12 h-12 text-gray-400" />
        )}

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            {isImage && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onPreview(attachment.fileKey)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDownload(attachment.fileKey, attachment.originalFilename)}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="p-4">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
          {attachment.originalFilename}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {attachment.fileSizeFormatted || formatFileSize(attachment.fileSize)}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(attachment.fileKey, attachment.originalFilename)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Tải xuống
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(attachment.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileCardUpload;
