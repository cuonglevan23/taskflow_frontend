// File Display Grid Component - SWR-powered for real-time sync
import React, { useEffect } from 'react';
import {
  Download,
  Eye,
  FileText,
  FileImage,
  FileVideo,
  File as FileIcon,
  Trash2
} from 'lucide-react';
import { useSWRFileUpload } from '@/hooks/useSWRFileUpload'; // Use new SWR hook
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileDisplayGridProps {
  taskId: number;
  onFileDelete?: (fileInfo: any) => void;
  className?: string;
  refreshTrigger?: number; // Add refresh trigger prop
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

export const FileDisplayGrid: React.FC<FileDisplayGridProps> = ({
  taskId,
  onFileDelete,
  className = '',
  refreshTrigger
}) => {
  // 🔥 NEW: Use SWR hook for auto-sync across components
  const {
    attachments,
    isLoading,
    error,
    deleteAttachment,
    downloadFile,
    previewFile,
    refreshAttachments
  } = useSWRFileUpload(taskId);

  // Refresh when refreshTrigger changes (from header upload)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('🔄 FileDisplayGrid refreshing due to trigger:', refreshTrigger);
      refreshAttachments();
    }
  }, [refreshTrigger, refreshAttachments]);

  // Handle delete attachment
  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachment(taskId, attachmentId);
      await refreshAttachments();
      onFileDelete?.(attachmentId);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  // Handle download
  const handleDownload = async (attachment: any) => {
    try {
      await downloadFile(attachment);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  // Handle preview - FIXED: Pass full attachment object instead of just fileKey
  const handlePreview = async (attachment: any) => {
    try {
      await previewFile(attachment);
    } catch (error) {
      console.error('Failed to preview file:', error);
    }
  };

  if (attachments.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-sm text-gray-400 italic">
          Chưa có file nào được tải lên
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-sm text-gray-400">
        {attachments.length} file{attachments.length > 1 ? 's' : ''}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((attachment) => (
          <FileCard
            key={attachment.id}
            attachment={attachment}
            onDelete={handleDeleteAttachment}
            onDownload={handleDownload}
            onPreview={handlePreview}
          />
        ))}
      </div>
    </div>
  );
};

// FileCard Component for displaying individual files
interface FileCardProps {
  attachment: any;
  onDelete: (id: number) => void;
  onDownload: (fileKey: string, fileName: string) => void;
  onPreview: (fileKey: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({
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
                onClick={() => onPreview(attachment)}
                className="bg-white/90 hover:bg-white text-gray-800"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDownload(attachment)}
              className="bg-white/90 hover:bg-white text-gray-800"
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
            onClick={() => onDownload(attachment)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Tải xuống
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(attachment.id)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileDisplayGrid;
