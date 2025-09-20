"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Create object URLs for images when attachments change
  useEffect(() => {
    const newImageUrls = new Map<string, string>();

    attachments.forEach(attachment => {
      if (attachment.type === 'image' && attachment.file) {
        // Create fresh object URL for each image
        const objectUrl = URL.createObjectURL(attachment.file);
        newImageUrls.set(attachment.id, objectUrl);

        console.log('Created object URL for:', attachment.file.name, 'URL:', objectUrl);
      }
    });

    setImageUrls(newImageUrls);

    // Cleanup function
    return () => {
      newImageUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [attachments]);

  // Handle image load success
  const handleImageLoad = useCallback((attachmentId: string) => {
    console.log('✅ Image loaded successfully:', attachmentId);
    setLoadedImages(prev => new Set(prev).add(attachmentId));
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(attachmentId);
      return newSet;
    });
  }, []);

  // Handle image load error
  const handleImageError = useCallback((attachmentId: string) => {
    console.error('❌ Image failed to load:', attachmentId);
    setFailedImages(prev => new Set(prev).add(attachmentId));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(attachmentId);
      return newSet;
    });
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (attachments.length === 0) return null;

  return (
    <div
      className="px-4 py-3 border-b"
      style={{ borderColor: DARK_THEME.border.default }}
    >
      <div className="flex flex-wrap gap-3">
        {attachments.map((attachment) => {
          const isImage = attachment.type === 'image';
          const imageUrl = imageUrls.get(attachment.id);
          const isLoaded = loadedImages.has(attachment.id);
          const hasFailed = failedImages.has(attachment.id);

          return (
            <div key={attachment.id} className="relative group">
              {isImage ? (
                // Image Preview
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-lg border-2 overflow-hidden bg-gray-100 dark:bg-gray-800"
                    style={{ borderColor: DARK_THEME.border.default }}
                  >
                    {hasFailed ? (
                      // Error state
                      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20">
                        <svg className="w-6 h-6 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-red-500">Error</span>
                      </div>
                    ) : imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={attachment.file.name}
                        className={`w-full h-full object-cover transition-opacity duration-200 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(attachment.id)}
                        onError={() => handleImageError(attachment.id)}
                        style={{
                          backgroundColor: '#f3f4f6',
                          imageRendering: 'auto'
                        }}
                      />
                    ) : (
                      // Loading state
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>

                  {/* Image name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg">
                    <div className="truncate text-center">
                      {attachment.file.name}
                    </div>
                  </div>

                  {/* Remove button overlay */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onRemove(attachment.id)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                      type="button"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                // File Preview
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border min-w-[200px] max-w-[300px]"
                  style={{
                    backgroundColor: DARK_THEME.background.muted,
                    borderColor: DARK_THEME.border.default
                  }}
                >
                  {/* File icon */}
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8"
                      style={{ color: THEME_COLORS.primary[500] }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium truncate text-sm"
                      style={{ color: DARK_THEME.text.primary }}
                    >
                      {attachment.file.name}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: DARK_THEME.text.muted }}
                    >
                      {formatFileSize(attachment.file.size)}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemove(attachment.id)}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors"
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
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentPreview;
