// components/FileAttachmentList.tsx
import React, { useState } from 'react';
import {
  File,
  Download,
  Trash2,
  Eye,
  Image,
  FileText,
  Video,
  Archive,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useFileDownload } from '@/hooks/useFileDownload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface FileAttachment {
  fileKey: string;
  fileName: string;
  fileSize?: number;
  contentType?: string;
  uploadedAt?: string;
  downloadUrl?: string;
}

interface FileAttachmentListProps {
  files: FileAttachment[];
  onFileDelete?: (fileKey: string) => void;
  onFileDownload?: (fileKey: string, fileName: string) => void;
  showActions?: boolean;
  className?: string;
}

export const FileAttachmentList: React.FC<FileAttachmentListProps> = ({
  files,
  onFileDelete,
  onFileDownload,
  showActions = true,
  className = ''
}) => {
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const { downloadFile, deleteFile } = useFileDownload();

  // Get file icon based on content type
  const getFileIcon = (contentType?: string, fileName?: string) => {
    if (!contentType && fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
        return <Image className="h-5 w-5 text-blue-500" />;
      }
      if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
        return <FileText className="h-5 w-5 text-red-500" />;
      }
      if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) {
        return <Video className="h-5 w-5 text-purple-500" />;
      }
      if (['zip', 'rar', '7z'].includes(ext || '')) {
        return <Archive className="h-5 w-5 text-orange-500" />;
      }
    }

    if (contentType?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (contentType?.startsWith('video/')) {
      return <Video className="h-5 w-5 text-purple-500" />;
    }
    if (contentType?.includes('pdf') || contentType?.includes('document')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (contentType?.includes('zip') || contentType?.includes('archive')) {
      return <Archive className="h-5 w-5 text-orange-500" />;
    }

    return <File className="h-5 w-5 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Get file type badge
  const getFileTypeBadge = (contentType?: string, fileName?: string) => {
    let type = 'FILE';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';

    if (contentType?.startsWith('image/') || fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      type = 'IMAGE';
      variant = 'default';
    } else if (contentType?.startsWith('video/') || fileName?.match(/\.(mp4|avi|mov|mkv)$/i)) {
      type = 'VIDEO';
      variant = 'secondary';
    } else if (contentType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      type = 'PDF';
      variant = 'destructive';
    } else if (contentType?.includes('document') || fileName?.match(/\.(doc|docx)$/i)) {
      type = 'DOC';
      variant = 'outline';
    }

    return <Badge variant={variant} className="text-xs">{type}</Badge>;
  };

  // Handle download
  const handleDownload = async (file: FileAttachment) => {
    setDownloadingFiles(prev => new Set(prev).add(file.fileKey));

    try {
      if (onFileDownload) {
        await onFileDownload(file.fileKey, file.fileName);
      } else {
        await downloadFile(file.fileKey, file.fileName);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingFiles(prev => {
        const next = new Set(prev);
        next.delete(file.fileKey);
        return next;
      });
    }
  };

  // Handle delete
  const handleDelete = async (file: FileAttachment) => {
    if (!confirm(`Are you sure you want to delete "${file.fileName}"?`)) {
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(file.fileKey));

    try {
      if (onFileDelete) {
        await onFileDelete(file.fileKey);
      } else {
        await deleteFile(file.fileKey);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingFiles(prev => {
        const next = new Set(prev);
        next.delete(file.fileKey);
        return next;
      });
    }
  };

  // Handle preview (for images)
  const handlePreview = (file: FileAttachment) => {
    if (file.downloadUrl) {
      window.open(file.downloadUrl, '_blank');
    }
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-sm">No files attached</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          Attachments ({files.length})
        </h4>
      </div>

      <div className="space-y-2">
        {files.map((file, index) => {
          const isDeleting = deletingFiles.has(file.fileKey);
          const isDownloading = downloadingFiles.has(file.fileKey);
          const isImage = file.contentType?.startsWith('image/') ||
            file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);

          return (
            <div
              key={file.fileKey || index}
              className={`
                flex items-center gap-3 p-3 border rounded-lg transition-all
                ${isDeleting ? 'opacity-50 bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50'}
              `}
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(file.contentType, file.fileName)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName}
                  </span>
                  {getFileTypeBadge(file.contentType, file.fileName)}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(file.fileSize)}</span>
                  {file.uploadedAt && (
                    <>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center gap-1">
                  {/* Preview for images */}
                  {isImage && file.downloadUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(file)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Download */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={isDownloading || isDeleting}
                    title="Download"
                  >
                    {isDownloading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>

                  {/* External link */}
                  {file.downloadUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.downloadUrl, '_blank')}
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file)}
                    disabled={isDeleting || isDownloading}
                    title="Delete"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isDeleting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileAttachmentList;
