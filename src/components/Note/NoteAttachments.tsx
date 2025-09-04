"use client";

import { useState, useCallback, useRef } from 'react';
import {
  Paperclip,
  Download,
  Eye,
  Trash2,
  Upload,
  File,
  Image,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui';
import { DARK_THEME } from '@/constants/theme';
import { NoteAttachmentProps, NoteAttachmentResponse } from '@/types/note';
import NoteApiService from '@/services/noteApi';

const NoteAttachments = ({
  noteId,
  attachments,
  onUploadSuccess,
  onDeleteSuccess,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = []
}: NoteAttachmentProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size must be less than ${formatFileSize(maxFileSize)}`;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const attachment = await NoteApiService.uploadAttachment(
        noteId,
        file,
        description.trim() || undefined
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      onUploadSuccess?.(attachment);
      setDescription('');

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [noteId, description, maxFileSize, allowedTypes, onUploadSuccess]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDownload = useCallback(async (attachment: NoteAttachmentResponse) => {
    try {
      await NoteApiService.downloadAttachment(attachment.id, attachment.fileName);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file');
    }
  }, []);

  const handlePreview = useCallback((attachment: NoteAttachmentResponse) => {
    if (attachment.isImage) {
      const previewUrl = NoteApiService.getAttachmentPreviewUrl(attachment.id);
      window.open(previewUrl, '_blank');
    }
  }, []);

  const handleDelete = useCallback(async (attachmentId: number) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      await NoteApiService.deleteAttachment(attachmentId);
      onDeleteSuccess?.(attachmentId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete attachment');
    }
  }, [onDeleteSuccess]);

  return (
    <div className="note-attachments space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          dragOver ? 'border-blue-500 bg-blue-50/10' : ''
        }`}
        style={{
          borderColor: dragOver ? DARK_THEME.primary : DARK_THEME.border.default,
          backgroundColor: dragOver ? DARK_THEME.primary + '10' : DARK_THEME.background.primary
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center">
          <Upload
            className="mx-auto h-8 w-8 mb-3"
            style={{ color: DARK_THEME.text.muted }}
          />

          <div className="mb-4">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: DARK_THEME.text.primary }}
            >
              Drag and drop a file here, or
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm"
              style={{
                borderColor: DARK_THEME.border.default,
                color: DARK_THEME.text.primary
              }}
            >
              Choose file
            </Button>
          </div>

          {/* Description input */}
          <div className="max-w-md mx-auto mb-4">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for the file"
              className="w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: DARK_THEME.background.secondary,
                borderColor: DARK_THEME.border.default,
                color: DARK_THEME.text.primary
              }}
              disabled={uploading}
            />
          </div>

          {/* File constraints */}
          <p className="text-xs" style={{ color: DARK_THEME.text.muted }}>
            Max file size: {formatFileSize(maxFileSize)}
            {allowedTypes.length > 0 && (
              <span className="block mt-1">
                Allowed types: {allowedTypes.join(', ')}
              </span>
            )}
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
            accept={allowedTypes.length > 0 ? allowedTypes.join(',') : undefined}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span style={{ color: DARK_THEME.text.primary }}>Uploading...</span>
              <span style={{ color: DARK_THEME.text.muted }}>{uploadProgress}%</span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-2"
              style={{ backgroundColor: DARK_THEME.background.muted }}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: DARK_THEME.primary,
                  width: `${uploadProgress}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="mt-4 p-3 rounded-md flex items-center gap-2"
            style={{
              backgroundColor: DARK_THEME.status.error + '20',
              borderColor: DARK_THEME.status.error
            }}
          >
            <AlertCircle className="h-4 w-4" style={{ color: DARK_THEME.status.error }} />
            <span className="text-sm" style={{ color: DARK_THEME.status.error }}>
              {error}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto p-1"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div>
          <h4
            className="text-sm font-medium mb-3 flex items-center gap-2"
            style={{ color: DARK_THEME.text.primary }}
          >
            <Paperclip className="h-4 w-4" />
            Attachments ({attachments.length})
          </h4>

          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 rounded-md border"
                style={{
                  backgroundColor: DARK_THEME.background.secondary,
                  borderColor: DARK_THEME.border.default
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* File icon */}
                  {attachment.isImage ? (
                    <Image className="h-5 w-5 flex-shrink-0" style={{ color: DARK_THEME.status.success }} />
                  ) : (
                    <File className="h-5 w-5 flex-shrink-0" style={{ color: DARK_THEME.text.muted }} />
                  )}

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: DARK_THEME.text.primary }}
                    >
                      {attachment.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: DARK_THEME.text.muted }}>
                      <span>{attachment.formattedFileSize}</span>
                      <span>•</span>
                      <span>{attachment.contentType}</span>
                      {attachment.description && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-32">{attachment.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-4">
                  {attachment.isImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(attachment)}
                      className="p-1.5"
                      title="Preview image"
                    >
                      <Eye className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="p-1.5"
                    title="Download file"
                  >
                    <Download className="h-4 w-4" style={{ color: DARK_THEME.text.muted }} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                    className="p-1.5"
                    title="Delete attachment"
                  >
                    <Trash2 className="h-4 w-4" style={{ color: DARK_THEME.status.error }} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success message */}
      {uploadProgress === 100 && (
        <div
          className="p-3 rounded-md flex items-center gap-2"
          style={{
            backgroundColor: DARK_THEME.status.success + '20',
            borderColor: DARK_THEME.status.success
          }}
        >
          <CheckCircle className="h-4 w-4" style={{ color: DARK_THEME.status.success }} />
          <span className="text-sm" style={{ color: DARK_THEME.status.success }}>
            File uploaded successfully!
          </span>
        </div>
      )}
    </div>
  );
};

export default NoteAttachments;
