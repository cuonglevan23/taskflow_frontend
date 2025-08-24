"use client";

import React from 'react';
import { ProjectFile } from '../context/ProjectFilesContext';
import { FileActions } from '../hooks/useProjectFileActions';
import { FileIcon } from './FileIcon';
import { Button } from '@/components/ui';
import { useTheme } from '@/layouts/hooks/useTheme';
import { X, Download, Share } from 'lucide-react';
import Image from 'next/image';

interface FilePreviewProps {
  file: ProjectFile | null;
  isOpen: boolean;
  onClose: () => void;
  actions: FileActions;
}

export function FilePreview({ file, isOpen, onClose, actions }: FilePreviewProps) {
  const { theme } = useTheme();
  
  if (!isOpen || !file) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = () => {
    const type = file.type.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type) || 
           file.mimeType.startsWith('image/');
  };

  const isPDF = () => {
    return file.type.toLowerCase() === 'pdf' || file.mimeType === 'application/pdf';
  };

  const isVideo = () => {
    const type = file.type.toLowerCase();
    return ['mp4', 'webm', 'ogg'].includes(type) || file.mimeType.startsWith('video/');
  };

  const isAudio = () => {
    const type = file.type.toLowerCase();
    return ['mp3', 'wav', 'ogg'].includes(type) || file.mimeType.startsWith('audio/');
  };

  const renderPreviewContent = () => {
    // Image preview
    if (isImage()) {
      return (
        <div 
          className="flex items-center justify-center rounded-lg p-4"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <div className="relative w-full" style={{ minHeight: "400px" }}>
            <Image
              src={file.url}
              alt={file.name}
              className="object-contain rounded-lg shadow-lg"
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      );
    }

    // PDF preview (embed)
    if (isPDF()) {
      return (
        <div 
          className="rounded-lg p-4"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <div className="aspect-[4/3] bg-white rounded border">
            <embed
              src={file.url}
              type="application/pdf"
              className="w-full h-full rounded"
            />
          </div>
        </div>
      );
    }

    // Video preview
    if (isVideo()) {
      return (
        <div 
          className="rounded-lg p-4"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <video
            controls
            className="w-full max-h-96 rounded-lg"
            preload="metadata"
          >
            <source src={file.url} type={file.mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio preview
    if (isAudio()) {
      return (
        <div 
          className="rounded-lg p-8 text-center"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <div className="mb-4">
            <FileIcon file={file} size="lg" />
          </div>
          <audio
            controls
            className="w-full max-w-md mx-auto"
            preload="metadata"
          >
            <source src={file.url} type={file.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // Text file preview (basic)
    if (file.mimeType.startsWith('text/') || file.type === 'md') {
      return (
        <div 
          className="rounded-lg p-4"
          style={{ backgroundColor: theme.background.secondary }}
        >
          <div className="text-center" style={{ color: theme.text.secondary }}>
            <FileIcon file={file} size="lg" />
            <p className="mt-4">Text file preview coming soon</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => actions.onFileDownload(file)}
              className="mt-2"
            >
              Download to view
            </Button>
          </div>
        </div>
      );
    }

    // Default - show file icon and download option
    return (
      <div 
        className="rounded-lg p-8 text-center"
        style={{ backgroundColor: theme.background.secondary }}
      >
        <div className="mb-4">
          <FileIcon file={file} size="lg" />
        </div>
        <p style={{ color: theme.text.secondary }} className="mb-4">
          Preview not available for this file type
        </p>
        <Button
          variant="default"
          onClick={() => actions.onFileDownload(file)}
        >
          Download File
        </Button>
      </div>
    );
  };

  return (
  <div 
  className="fixed inset-0 flex items-center justify-center z-50 p-4"
  style={{ backgroundColor: "rgba(66, 66, 68, .75)" }}
>
      <div 
        className="rounded-lg max-w-6xl max-h-full w-full overflow-auto shadow-2xl"
        style={{ backgroundColor: theme.background.primary }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 p-6 z-10 border-b"
          style={{ 
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileIcon file={file} size="md" />
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: theme.text.primary }}
                >
                  {file.name}
                </h3>
                <p style={{ color: theme.text.secondary }} className="text-sm">
                  {formatFileSize(file.size)} • {file.type.toUpperCase()} • 
                  Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => actions.onFileDownload(file)}
                className="flex items-center gap-1"
              >
                <Download size={16} />
                <span>Download</span>
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => actions.onFileShare(file)}
                className="flex items-center gap-1"
              >
                <Share size={16} />
                <span>Share</span>
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-1"
              >
                <X size={16} />
                <span>Close</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview */}
            <div className="lg:col-span-2">
              {renderPreviewContent()}
            </div>

            {/* File Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 
                  className="font-medium mb-3"
                  style={{ color: theme.text.primary }}
                >
                  File Details
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt style={{ color: theme.text.secondary }}>Type:</dt>
                    <dd style={{ color: theme.text.primary, fontWeight: 500 }}>{file.type.toUpperCase()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ color: theme.text.secondary }}>Size:</dt>
                    <dd style={{ color: theme.text.primary }}>{formatFileSize(file.size)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ color: theme.text.secondary }}>Version:</dt>
                    <dd style={{ color: theme.text.primary }}>v{file.version}</dd>
                  </div>
                </dl>
              </div>

              {/* Upload Info */}
              <div>
                <h4 
                  className="font-medium mb-3"
                  style={{ color: theme.text.primary }}
                >
                  Upload Info
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <dt style={{ color: theme.text.secondary }}>Uploaded by:</dt>
                    <dd className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ 
                          backgroundColor: theme.background.tertiary,
                          color: theme.text.primary 
                        }}
                      >
                        {file.uploadedBy.avatar}
                      </div>
                      <span style={{ color: theme.text.primary }}>{file.uploadedBy.name}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ color: theme.text.secondary }}>Upload date:</dt>
                    <dd style={{ color: theme.text.primary }}>
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ color: theme.text.secondary }}>Last updated:</dt>
                    <dd style={{ color: theme.text.primary }}>
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Tags */}
              {file.tags.length > 0 && (
                <div>
                  <h4 
                    className="font-medium mb-3"
                    style={{ color: theme.text.primary }}
                  >
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {file.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ 
                          backgroundColor: theme.background.tertiary,
                          color: theme.text.secondary
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {file.description && (
                <div>
                  <h4 
                    className="font-medium mb-3"
                    style={{ color: theme.text.primary }}
                  >
                    Description
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: theme.text.secondary }}
                  >
                    {file.description}
                  </p>
                </div>
              )}

              {/* Sharing Info */}
              {file.isShared && file.sharedWith.length > 0 && (
                <div>
                  <h4 
                    className="font-medium mb-3"
                    style={{ color: theme.text.primary }}
                  >
                    Shared With
                  </h4>
                  <div className="space-y-1 text-sm">
                    {file.sharedWith.map(userId => (
                      <div key={userId} className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          style={{ 
                            backgroundColor: theme.background.tertiary,
                            color: theme.text.primary 
                          }}
                        >
                          {userId.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ color: theme.text.primary }}>{userId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}