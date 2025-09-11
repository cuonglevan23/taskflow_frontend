"use client";

import React, { useRef } from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';

interface FileAttachmentButtonProps {
  onFileSelect: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  allowedTypes?: string[]; // MIME types
}

const FileAttachmentButton: React.FC<FileAttachmentButtonProps> = ({
  onFileSelect,
  disabled = false,
  maxFiles = 5,
  maxSizePerFile = 50 * 1024 * 1024, // 50MB
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ]
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isValidFileType = (file: File): boolean => {
    // Check MIME type first
    if (allowedTypes.includes(file.type)) {
      return true;
    }

    // Fallback check by extension for files with missing MIME types
    const extension = getFileExtension(file.name);
    const extensionMap: { [key: string]: string[] } = {
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'application/vnd.ms-excel': ['xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
      'application/vnd.ms-powerpoint': ['ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
      'text/plain': ['txt'],
      'application/zip': ['zip'],
      'application/x-rar-compressed': ['rar'],
      'application/x-7z-compressed': ['7z']
    };

    return Object.values(extensionMap).some(extensions => extensions.includes(extension));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(file => !isValidFileType(file));
    if (invalidFiles.length > 0) {
      alert('Loại file không được hỗ trợ! Chỉ chấp nhận: PDF, Word, Excel, PowerPoint, Text, ZIP, RAR, 7Z');
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSizePerFile);
    if (oversizedFiles.length > 0) {
      alert(`File quá lớn! Kích thước tối đa cho mỗi file là ${Math.round(maxSizePerFile / (1024 * 1024))}MB`);
      return;
    }

    // Validate number of files
    if (files.length > maxFiles) {
      alert(`Chỉ được chọn tối đa ${maxFiles} file cùng lúc`);
      return;
    }

    onFileSelect(files);

    // Reset input
    e.target.value = '';
  };

  const acceptString = allowedTypes.join(',');

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        className="p-2 rounded-full transition-colors disabled:opacity-50 hover:bg-opacity-10"
        style={{
          color: disabled ? DARK_THEME.text.muted : THEME_COLORS.primary[500]
        }}
        title="Gửi file"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default FileAttachmentButton;
