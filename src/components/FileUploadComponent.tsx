// File Upload Component for TaskDetailPanel
import React, { useRef, useState, useCallback } from 'react';
import { Upload, File, X, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadComponentProps {
  taskId: number;
  onUploadComplete?: (fileInfo: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  folder?: string;
  maxFileSize?: number;
  acceptedTypes?: string[];
}

interface FilePreview {
  file: File;
  preview?: string;
  id: string;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  taskId,
  onUploadComplete,
  onUploadError,
  className = '',
  folder = 'documents',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.mp4', '.avi', '.mov']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const {
    isUploading,
    uploadProgress,
    uploadResults,
    uploadFiles,
    clearResults,
    getUploadSummary
  } = useFileUpload();

  // Validate individual file
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${maxFileSize / 1024 / 1024}MB.`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not supported.`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  // Process and validate files
  const processFiles = (files: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const results = await uploadFiles(selectedFiles, taskId, folder);

      // Call callback for successful uploads
      results.forEach(result => {
        if (result.success && onUploadComplete) {
          onUploadComplete(result);
        }
      });

      const summary = getUploadSummary();
      if (summary.failed > 0 && onUploadError) {
        onUploadError(`${summary.failed} file(s) failed to upload`);
      }

      // Clear selected files after successful upload
      if (summary.success > 0) {
        setSelectedFiles([]);
        setErrors([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setErrors([errorMessage]);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  // Clear all
  const handleClear = () => {
    setSelectedFiles([]);
    setErrors([]);
    clearResults();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Click to upload files or drag and drop
            </span>
            <span className="text-xs text-gray-500">
              Max {maxFileSize / 1024 / 1024}MB per file • {acceptedTypes.join(', ')}
            </span>
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length}):</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {uploadProgress.currentFile
                ? `Uploading: ${uploadProgress.currentFile}`
                : 'Processing...'
              }
            </span>
            <span>{uploadProgress.percentage}%</span>
          </div>
          <Progress value={uploadProgress.percentage} className="w-full" />
          <div className="text-xs text-gray-500 text-center">
            {uploadProgress.completed} of {uploadProgress.total} files completed
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Upload Results:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded text-sm ${
                  result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="flex-1 truncate">
                  {result.fileName}
                  {result.success ? ' - Uploaded successfully' : ` - ${result.error}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {selectedFiles.length} file(s)
            </>
          )}
        </Button>

        {uploadResults.length > 0 && (
          <Button
            variant="outline"
            onClick={() => clearResults()}
            disabled={isUploading}
          >
            Clear Results
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileUploadComponent;
