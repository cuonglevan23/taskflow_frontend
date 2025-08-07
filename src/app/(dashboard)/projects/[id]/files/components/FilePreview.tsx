"use client";

import React from 'react';
import { ProjectFile } from '../context/ProjectFilesContext';
import { FileActions } from '../hooks/useProjectFileActions';
import { FileIcon } from './FileIcon';
import { Button, DownloadButton, ShareButton } from '@/components/ui';

interface FilePreviewProps {
  file: ProjectFile | null;
  isOpen: boolean;
  onClose: () => void;
  actions: FileActions;
}

export function FilePreview({ file, isOpen, onClose, actions }: FilePreviewProps) {
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
        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    }

    // PDF preview (embed)
    if (isPDF()) {
      return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
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
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
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
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
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
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="text-center text-gray-600 dark:text-gray-400">
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
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
        <div className="mb-4">
          <FileIcon file={file} size="lg" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Preview not available for this file type
        </p>
        <Button
          variant="primary"
          onClick={() => actions.onFileDownload(file)}
        >
          Download File
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl max-h-full w-full overflow-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileIcon file={file} size="md" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(file.size)} • {file.type.toUpperCase()} • 
                  Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DownloadButton
                onClick={() => actions.onFileDownload(file)}
                variant="ghost"
                size="sm"
              />
              
              <ShareButton
                onClick={() => actions.onFileShare(file)}
                variant="ghost"
                size="sm"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                }
                title="Close"
              />
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
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">File Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Type:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-medium">{file.type.toUpperCase()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Size:</dt>
                    <dd className="text-gray-900 dark:text-gray-100">{formatFileSize(file.size)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Version:</dt>
                    <dd className="text-gray-900 dark:text-gray-100">v{file.version}</dd>
                  </div>
                </dl>
              </div>

              {/* Upload Info */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Upload Info</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <dt className="text-gray-600 dark:text-gray-400">Uploaded by:</dt>
                    <dd className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {file.uploadedBy.avatar}
                      </div>
                      <span className="text-gray-900 dark:text-gray-100">{file.uploadedBy.name}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Upload date:</dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Last updated:</dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Tags */}
              {file.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {file.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full"
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
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {file.description}
                  </p>
                </div>
              )}

              {/* Sharing Info */}
              {file.isShared && file.sharedWith.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Shared With</h4>
                  <div className="space-y-1 text-sm">
                    {file.sharedWith.map(userId => (
                      <div key={userId} className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs">
                          {userId.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-gray-900 dark:text-gray-100">{userId}</span>
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