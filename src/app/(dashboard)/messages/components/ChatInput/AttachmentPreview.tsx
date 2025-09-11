"use client";

import React, { useState, useEffect } from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import { AttachmentFile } from './ChatInput';

interface AttachmentPreviewProps {
  attachments: AttachmentFile[];
  onRemove: (id: string) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onRemove
}) => {
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  if (attachments.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageError = (attachmentId: string) => {
    console.error('Image failed to load for attachment:', attachmentId);
    setImageLoadErrors(prev => new Set(prev).add(attachmentId));
  };

  const handleImageLoad = (attachmentId: string) => {
    console.log('Image loaded successfully for attachment:', attachmentId);
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(attachmentId);
      return newSet;
    });
  };

  const getFileIcon = (file: File): React.ReactNode => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (file.type.startsWith('image/')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }

    // PDF
    if (extension === 'pdf') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3 3h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l3-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
      );
    }

    // Word documents
    if (['doc', 'docx'].includes(extension || '')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      );
    }

    // Excel documents
    if (['xls', 'xlsx'].includes(extension || '')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <polyline points="14,2 14,8 20,8"/>
          <rect x="8" y="12" width="8" height="2"/>
          <rect x="8" y="16" width="8" height="2"/>
        </svg>
      );
    }

    // Archive files
    if (['zip', 'rar', '7z'].includes(extension || '')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="8" width="18" height="4" rx="1"/>
          <rect x="3" y="4" width="18" height="4" rx="1"/>
          <rect x="3" y="12" width="18" height="8" rx="1"/>
        </svg>
      );
    }

    // Default file icon
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: DARK_THEME.border.default }}>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="relative group"
          >
            {attachment.type === 'image' && attachment.preview ? (
              // Image preview with better error handling
              <div className="relative">
                {imageLoadErrors.has(attachment.id) ? (
                  // Show fallback when image fails to load
                  <div
                    className="w-20 h-20 rounded-lg border flex items-center justify-center"
                    style={{
                      borderColor: DARK_THEME.border.default,
                      backgroundColor: DARK_THEME.background.muted
                    }}
                  >
                    <div className="text-center">
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: DARK_THEME.text.muted }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-xs" style={{ color: DARK_THEME.text.muted }}>
                        Failed
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="w-20 h-20 object-cover rounded-lg border"
                    style={{
                      borderColor: DARK_THEME.border.default,
                      backgroundColor: DARK_THEME.background.secondary // Add background color as fallback
                    }}
                    onLoad={() => handleImageLoad(attachment.id)}
                    onError={() => handleImageError(attachment.id)}
                    loading="lazy"
                  />
                )}

                {/* Hover overlay with remove button */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => onRemove(attachment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* File name overlay */}
                <div className="absolute bottom-1 left-1 right-1">
                  <div
                    className="text-xs px-1 py-0.5 rounded text-white truncate text-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                  >
                    {attachment.file.name}
                  </div>
                </div>
              </div>
            ) : (
              // File preview for non-images
              <div
                className="flex items-center gap-2 p-3 rounded-lg border min-w-[200px] max-w-[300px]"
                style={{
                  backgroundColor: DARK_THEME.background.muted,
                  borderColor: DARK_THEME.border.default
                }}
              >
                <div style={{ color: THEME_COLORS.primary[500] }}>
                  {getFileIcon(attachment.file)}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: DARK_THEME.text.primary }}
                  >
                    {attachment.file.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: DARK_THEME.text.muted }}
                  >
                    {formatFileSize(attachment.file.size)}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(attachment.id)}
                  className="p-1 rounded-full transition-colors hover:bg-red-500 hover:text-white"
                  style={{ color: DARK_THEME.text.muted }}
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentPreview;
