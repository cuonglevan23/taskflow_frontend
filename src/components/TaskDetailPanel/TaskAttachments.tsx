import React, { useState } from 'react';
import { Download, Eye, X, Image, FileText, File, Video, Music } from 'lucide-react';
import { TaskAttachment } from '@/components/TaskList/types';
import { DARK_THEME } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

interface TaskAttachmentsProps {
  attachments: TaskAttachment[];
  onRemoveAttachment?: (attachmentId: string) => void;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  attachments,
  onRemoveAttachment
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const isImageFile = (type: string) => type.startsWith('image/');

  const handleDownload = (attachment: TaskAttachment) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (attachment: TaskAttachment) => {
    if (isImageFile(attachment.type)) {
      setPreviewImage(attachment.url);
    } else {
      // For non-image files, open in new tab
      window.open(attachment.url, '_blank');
    }
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <File className="w-4 h-4" />
          Attachments ({attachments.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative group border rounded-lg overflow-hidden hover:border-gray-500 transition-colors"
              style={{
                borderColor: DARK_THEME.border.default,
                backgroundColor: DARK_THEME.background.secondary
              }}
            >
              {/* File Preview/Icon */}
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative overflow-hidden">
                {isImageFile(attachment.type) ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handlePreview(attachment)}
                  />
                ) : (
                  <div className="text-gray-400">
                    {getFileIcon(attachment.type)}
                  </div>
                )}

                {/* Overlay buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreview(attachment)}
                    className="text-white hover:bg-white/20"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(attachment)}
                    className="text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {onRemoveAttachment && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveAttachment(attachment.id)}
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <div className="text-sm text-white truncate" title={attachment.name}>
                  {attachment.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatFileSize(attachment.size)}
                </div>
                {attachment.uploadedBy && (
                  <div className="text-xs text-gray-500 mt-1">
                    by {attachment.uploadedBy.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskAttachments;
