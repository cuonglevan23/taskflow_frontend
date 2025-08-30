// TaskFiles Component - Complete implementation based on S3_FILE_VIEWING_AND_DOWNLOAD_GUIDE.md
"use client";

import React, { useState, useEffect } from 'react';
import { useTaskFiles } from '@/hooks/useTaskFiles';
import simpleFileService, { TaskAttachment } from '@/services/simpleFileService';

interface TaskFilesProps {
  taskId: number;
  className?: string;
}

interface FilePreviewModalProps {
  file: TaskAttachment | null;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  const [previewError, setPreviewError] = useState(false);
  const [loading, setLoading] = useState(true);

  const renderPreview = () => {
    if (file.contentType.startsWith('image/')) {
      return (
        <div style={{ position: 'relative' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>Đang tải ảnh...</div>
            </div>
          )}

          {previewError ? (
            <div className="preview-error">
              <p>Không thể hiển thị ảnh</p>
              <button
                onClick={() => window.open(file.downloadUrl, '_blank')}
                className="btn-open-file"
              >
                Mở ảnh trong tab mới
              </button>
            </div>
          ) : (
            <img
              src={file.downloadUrl}
              alt={file.originalFilename}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: loading ? 'none' : 'block'
              }}
              onLoad={() => {
                setLoading(false);
                console.log('✅ Image loaded successfully');
              }}
              onError={(e) => {
                console.error('❌ Image failed to load:', e);
                setLoading(false);
                setPreviewError(true);
              }}
              crossOrigin="anonymous"
            />
          )}
        </div>
      );
    }

    if (file.contentType === 'application/pdf') {
      return (
        <div style={{ position: 'relative' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>Đang tải PDF...</div>
            </div>
          )}

          {previewError ? (
            <div className="preview-error">
              <p>Không thể hiển thị PDF</p>
              <button
                onClick={() => window.open(file.downloadUrl, '_blank')}
                className="btn-open-file"
              >
                Mở PDF trong tab mới
              </button>
            </div>
          ) : (
            <iframe
              src={file.downloadUrl}
              width="100%"
              height="70vh"
              title={file.originalFilename}
              style={{ display: loading ? 'none' : 'block' }}
              onLoad={() => {
                setLoading(false);
                console.log('✅ PDF loaded successfully');
              }}
              onError={(e) => {
                console.error('❌ PDF failed to load:', e);
                setLoading(false);
                setPreviewError(true);
              }}
            />
          )}
        </div>
      );
    }

    return (
      <div className="no-preview">
        <p>Không thể preview file này</p>
        <button
          onClick={() => window.open(file.downloadUrl, '_blank')}
          className="btn-open-file"
        >
          Mở file
        </button>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{file.originalFilename}</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => window.open(file.downloadUrl, '_blank')}
              className="btn-open-external"
              title="Mở trong tab mới"
            >
              🔗
            </button>
            <button onClick={onClose} className="btn-close">✕</button>
          </div>
        </div>
        <div className="modal-body">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

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
    validateFile,
    refreshData
  } = useTaskFiles(taskId);

  const [dragOver, setDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [previewFile, setPreviewFile] = useState<TaskAttachment | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  // Filter files based on search and type
  const filteredFiles = attachments.filter(file => {
    const matchesSearch = file.originalFilename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' ||
      (filterType === 'images' && file.contentType.startsWith('image/')) ||
      (filterType === 'documents' && (
        file.contentType.includes('document') ||
        file.contentType.includes('pdf')
      )) ||
      (filterType === 'videos' && file.contentType.startsWith('video/'));

    return matchesSearch && matchesType;
  });

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
      console.log('📥 Downloading file:', attachment.originalFilename);
      console.log('🔗 Using direct S3 URL:', attachment.downloadUrl);

      // Use direct S3 URL from backend response (no refresh needed)
      // Create download link with proper filename
      const link = document.createElement('a');
      link.href = attachment.downloadUrl;
      link.download = attachment.originalFilename;
      link.target = '_blank';
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Download initiated for:', attachment.originalFilename);
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert(`Không thể tải file "${attachment.originalFilename}". Vui lòng thử l���i sau.`);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!confirm('Bạn có chắc muốn xóa file này?')) return;

    try {
      await simpleFileService.deleteAttachment(attachmentId);
      await refreshData(); // Reload data
      alert('Xóa file thành công!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Không thể xóa file. Vui lòng thử lại.');
    }
  };

  const handlePreview = async (attachment: TaskAttachment) => {
    try {
      console.log('👁️ Previewing file:', attachment.originalFilename);

      if (simpleFileService.canPreviewFile(attachment)) {
        // Use direct S3 URL for preview
        setPreviewFile(attachment);
      } else {
        // Open in new tab if can't preview
        window.open(attachment.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('❌ Preview failed:', error);
      alert('Không thể xem trước file. Vui lòng thử tải về.');
    }
  };

  const handleBulkDownload = async () => {
    const filesToDownload = attachments.filter(file => selectedFiles.includes(file.id));
    if (filesToDownload.length === 0) {
      alert('Vui lòng chọn file để tải về');
      return;
    }

    try {
      await simpleFileService.bulkDownload(filesToDownload);
      setSelectedFiles([]);
    } catch (error) {
      alert('Có lỗi xảy ra khi tải file. Vui lòng thử lại.');
    }
  };

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  const isImageFile = (contentType: string): boolean => {
    return simpleFileService.isImageFile(contentType);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className={`task-files ${className}`}>
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className={`task-files ${className}`}>
      {/* Header with stats */}
      <div className="files-header">
        <h3>📎 File đính kèm</h3>
        {stats && (
          <div className="files-stats">
            <span>{stats.totalFiles} files</span>
            <span>•</span>
            <span>{stats.totalSizeFormatted}</span>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      {attachments.length > 0 && (
        <div className="files-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="images">Hình ảnh</option>
              <option value="documents">Tài liệu</option>
              <option value="videos">Video</option>
            </select>
          </div>

          {selectedFiles.length > 0 && (
            <div className="bulk-actions">
              <button onClick={handleBulkDownload} className="btn-bulk-download">
                Tải {selectedFiles.length} file
              </button>
              <button onClick={() => setSelectedFiles([])} className="btn-clear-selection">
                Bỏ chọn
              </button>
            </div>
          )}
        </div>
      )}

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
            <div>⏳ Đang upload...</div>
          ) : (
            <div>
              📁 Kéo thả file vào đây hoặc click để chọn
              <div className="upload-hint">Hỗ trợ: PDF, Hình ảnh, Tài liệu, Video (Tối đa 10MB)</div>
            </div>
          )}
        </label>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 && !loading ? (
        <div className="no-files">
          <p>Chưa có file nào được đính kèm</p>
        </div>
      ) : (
        <div className="files-list">
          {/* Select All */}
          {filteredFiles.length > 1 && (
            <div className="select-all-container">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedFiles.length === filteredFiles.length}
                  onChange={selectAllFiles}
                />
                Chọn tất cả ({filteredFiles.length} files)
              </label>
            </div>
          )}

          {filteredFiles.map((file) => (
            <div key={file.id} className={`file-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}>
              <div className="file-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                />
              </div>

              <div className="file-info">
                <div className="file-icon">
                  {getFileIcon(file.contentType)}
                </div>
                <div className="file-details">
                  <div className="file-name">{file.originalFilename}</div>
                  <div className="file-meta">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>•</span>
                    <span>Bởi {file.uploadedBy}</span>
                    <span>•</span>
                    <span>{new Date(file.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="file-actions">
                {/* Preview cho image và PDF */}
                {simpleFileService.canPreviewFile(file) && (
                  <button
                    onClick={() => handlePreview(file)}
                    className="btn-preview"
                    title="Xem trước"
                  >
                    👁️
                  </button>
                )}

                {/* Download */}
                <button
                  onClick={() => handleDownload(file)}
                  className="btn-download"
                  title="Tải về"
                >
                  ⬇️
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(file.id)}
                  className="btn-delete"
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Styles */}
      <style jsx>{`
        .task-files {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .files-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e1e5e9;
        }

        .files-header h3 {
          margin: 0;
          font-size: 18px;
          color: #2c3e50;
        }

        .files-stats {
          font-size: 14px;
          color: #6c757d;
        }

        .files-stats span {
          margin: 0 4px;
        }

        .files-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          min-width: 200px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .bulk-actions {
          display: flex;
          gap: 8px;
          margin-left: auto;
        }

        .btn-bulk-download, .btn-clear-selection {
          padding: 6px 12px;
          border: 1px solid #007bff;
          border-radius: 4px;
          background: #007bff;
          color: white;
          font-size: 12px;
          cursor: pointer;
        }

        .btn-clear-selection {
          background: #6c757d;
          border-color: #6c757d;
        }

        .upload-area {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          margin-bottom: 16px;
          background: #fafbfc;
          transition: all 0.2s;
        }

        .upload-area:hover, .upload-area.drag-over {
          border-color: #007bff;
          background: #f0f8ff;
        }

        .upload-area.uploading {
          border-color: #28a745;
          background: #f0fff0;
        }

        .upload-label {
          cursor: pointer;
          display: block;
        }

        .upload-hint {
          font-size: 12px;
          color: #6c757d;
          margin-top: 8px;
        }

        .no-files {
          text-align: center;
          padding: 32px;
          color: #6c757d;
          font-style: italic;
        }

        .select-all-container {
          margin-bottom: 12px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .select-all {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .file-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 1px solid #e1e5e9;
          border-radius: 6px;
          background-color: #f8f9fa;
          transition: all 0.2s;
        }

        .file-item:hover {
          background-color: #e9ecef;
        }

        .file-item.selected {
          background-color: #e3f2fd;
          border-color: #2196f3;
        }

        .file-checkbox {
          margin-right: 12px;
        }

        .file-info {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .file-icon {
          font-size: 24px;
          margin-right: 12px;
        }

        .file-details {
          flex: 1;
        }

        .file-name {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 4px;
          word-break: break-word;
        }

        .file-meta {
          font-size: 12px;
          color: #6c757d;
        }

        .file-meta span {
          margin: 0 4px;
        }

        .file-actions {
          display: flex;
          gap: 8px;
        }

        .file-actions button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .btn-preview:hover {
          background-color: #e3f2fd;
        }

        .btn-download:hover {
          background-color: #e8f5e8;
        }

        .btn-delete:hover {
          background-color: #ffebee;
        }

        .loading {
          text-align: center;
          padding: 32px;
          color: #6c757d;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e1e5e9;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 16px;
          color: #2c3e50;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .btn-close:hover {
          background-color: #f8f9fa;
        }

        .modal-body {
          padding: 20px;
          text-align: center;
        }

        .no-preview {
          padding: 40px;
        }

        .btn-open-file {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 16px;
        }

        .btn-open-external {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .btn-open-external:hover {
          background-color: #f8f9fa;
        }

        .preview-error {
          padding: 40px;
          text-align: center;
          color: #dc3545;
        }

        .preview-error p {
          margin-bottom: 16px;
          font-style: italic;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .file-item {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .file-actions {
            margin-top: 8px;
            align-self: flex-end;
          }
          
          .files-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .file-name {
            font-size: 14px;
          }
          
          .file-meta {
            font-size: 11px;
          }

          .files-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: auto;
          }

          .bulk-actions {
            margin-left: 0;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskFiles;
