import React, { useState } from 'react';
import { Download, Eye, X, Image, FileText, File, Video, Music } from 'lucide-react';
import { TaskAttachment } from '@/components/TaskList/types';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Button } from '@/components/ui/button';

interface TaskAttachmentsProps {
  attachments: TaskAttachment[];
  onRemoveAttachment?: (attachmentId: string) => void;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  attachments,
  onRemoveAttachment
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { themeMode } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get nested message value
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return `0 ${t('taskAttachments.fileSizes.bytes')}`;
    const k = 1024;
    const sizes = [
      t('taskAttachments.fileSizes.bytes'),
      t('taskAttachments.fileSizes.kb'),
      t('taskAttachments.fileSizes.mb'),
      t('taskAttachments.fileSizes.gb')
    ];
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

  const isDark = themeMode === 'dark';

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <h3 className={`text-sm font-medium flex items-center gap-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <File className="w-4 h-4" />
          {t('taskAttachments.title')} ({attachments.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={`relative group border rounded-lg overflow-hidden hover:border-gray-500 transition-colors ${
                isDark 
                  ? 'border-gray-700 bg-gray-800' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* File Preview/Icon */}
              <div className={`aspect-video flex items-center justify-center relative overflow-hidden ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                {isImageFile(attachment.type) ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handlePreview(attachment)}
                  />
                ) : (
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
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
                    title={t('taskAttachments.preview')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(attachment)}
                    className="text-white hover:bg-white/20"
                    title={t('taskAttachments.download')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {onRemoveAttachment && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveAttachment(attachment.id)}
                      className="text-red-400 hover:bg-red-500/20"
                      title={t('taskAttachments.remove')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="p-3">
                <div className={`text-sm truncate ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`} title={attachment.name}>
                  {attachment.name}
                </div>
                <div className={`text-xs mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatFileSize(attachment.size)}
                </div>
                {attachment.uploadedBy && (
                  <div className={`text-xs mt-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {t('taskAttachments.uploadedBy')} {attachment.uploadedBy.name}
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
              alt={t('taskAttachments.previewAlt')}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              title={t('taskAttachments.closePreview')}
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
