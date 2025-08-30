// TaskFiles Component - Simple file display and upload without progress tracking
"use client";

import React, { useState } from 'react';
import { useTaskFiles } from '@/hooks/useTaskFiles';
import { TaskAttachment } from '@/services/simpleFileService';

interface TaskFilesProps {
  taskId: number;
  className?: string;
}

export const TaskFiles: React.FC<TaskFilesProps> = ({ taskId, className = '' }) => {
  const {
    attachments,
    stats,
    loading,
    uploading,
    uploadFile,
    uploadFiles,
    deleteFile,
    downloadFile,
    formatFileSize,
    getFileIcon,
    validateFile
  } = useTaskFiles(taskId);

  const [dragOver, setDragOver] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    // Validate files
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      }
    });

    // Show validation errors
    if (invalidFiles.length > 0) {
      alert(`Invalid files:\n${invalidFiles.join('\n')}`);
    }

    // Upload valid files
    if (validFiles.length > 0) {
      const success = await uploadFiles(validFiles);
      if (!success) {
        alert('Some files failed to upload. Please try again.');
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      const success = await uploadFiles(files);
      if (!success) {
        alert('Some files failed to upload. Please try again.');
      }
    }

    // Reset input
    e.target.value = '';
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      await downloadFile(attachment);
    } catch (error) {
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDelete = async (attachment: TaskAttachment) => {
    if (confirm(`Are you sure you want to delete "${attachment.originalFilename}"?`)) {
      const success = await deleteFile(attachment.id);
      if (!success) {
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className={`task-files ${className}`}>
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  return (
    <div className={`task-files ${className}`}>
      {/* Header with stats */}
      <div className="files-header">
        <h4>
          📎 Files
          {stats && ` (${stats.totalFiles} files, ${stats.totalSizeFormatted})`}
        </h4>
      </div>

      {/* Upload Area */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id={`file-input-${taskId}`}
          disabled={uploading}
        />

        <label htmlFor={`file-input-${taskId}`} className="upload-label">
          {uploading ? (
            <div>⏳ Uploading...</div>
          ) : (
            <div>
              📁 Drop files here or click to upload
              <div className="upload-hint">Support: PDF, Images, Documents, Videos (Max 10MB)</div>
            </div>
          )}
        </label>
      </div>

      {/* Files List */}
      <div className="files-list">
        {attachments.length === 0 ? (
          <div className="no-files">No files attached to this task</div>
        ) : (
          attachments.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-info">
                <div className="file-icon">{getFileIcon(file.contentType)}</div>
                <div className="file-details">
                  <div className="file-name" title={file.originalFilename}>
                    {file.originalFilename}
                  </div>
                  <div className="file-meta">
                    {formatFileSize(file.fileSize)} •
                    {file.uploadedBy} •
                    {new Date(file.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              <div className="file-actions">
                <button
                  onClick={() => handleDownload(file)}
                  className="btn-download"
                  title="Download file"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => handleDelete(file)}
                  className="btn-delete"
                  title="Delete file"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .task-files {
          margin-top: 16px;
          padding: 16px;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: #fafbfc;
        }

        .files-header h4 {
          margin: 0 0 16px 0;
          color: #172b4d;
          font-size: 16px;
          font-weight: 600;
        }

        .upload-area {
          border: 2px dashed #dfe1e6;
          border-radius: 6px;
          padding: 24px;
          text-align: center;
          margin-bottom: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .upload-area:hover,
        .upload-area.drag-over {
          border-color: #0052cc;
          background: #f4f5f7;
        }

        .upload-area.uploading {
          border-color: #ffab00;
          background: #fffbf0;
          cursor: not-allowed;
        }

        .upload-label {
          display: block;
          cursor: pointer;
          color: #5e6c84;
        }

        .upload-hint {
          font-size: 12px;
          color: #8993a4;
          margin-top: 4px;
        }

        .files-list {
          gap: 8px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: white;
          border: 1px solid #dfe1e6;
          border-radius: 6px;
          transition: box-shadow 0.2s ease;
        }

        .file-item:hover {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .file-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .file-details {
          min-width: 0;
          flex: 1;
        }

        .file-name {
          font-weight: 500;
          color: #172b4d;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-meta {
          font-size: 12px;
          color: #5e6c84;
          margin-top: 2px;
        }

        .file-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-download, .btn-delete {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .btn-download:hover {
          background: #e4f3ff;
        }

        .btn-delete:hover {
          background: #ffebe6;
        }

        .no-files {
          text-align: center;
          color: #8993a4;
          padding: 32px;
          font-style: italic;
        }

        .loading {
          text-align: center;
          padding: 32px;
          color: #5e6c84;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .file-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .file-actions {
            align-self: flex-end;
          }
          
          .upload-area {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskFiles;
