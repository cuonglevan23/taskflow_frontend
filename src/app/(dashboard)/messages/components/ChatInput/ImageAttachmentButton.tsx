"use client";

import React, { useRef } from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';

interface ImageAttachmentButtonProps {
  onImageSelect: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
}

const ImageAttachmentButton: React.FC<ImageAttachmentButtonProps> = ({
  onImageSelect,
  disabled = false,
  maxFiles = 10,
  maxSizePerFile = 10 * 1024 * 1024 // 10MB
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file types
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      alert('Chỉ được chọn file ảnh (jpg, png, gif, webp, etc.)');
      return;
    }

    // Validate file sizes
    const oversizedFiles = imageFiles.filter(file => file.size > maxSizePerFile);
    if (oversizedFiles.length > 0) {
      alert(`File quá lớn! Kích thước tối đa cho mỗi ảnh là ${Math.round(maxSizePerFile / (1024 * 1024))}MB`);
      return;
    }

    // Validate number of files
    if (imageFiles.length > maxFiles) {
      alert(`Chỉ được chọn tối đa ${maxFiles} ảnh cùng lúc`);
      return;
    }

    onImageSelect(imageFiles);

    // Reset input
    e.target.value = '';
  };

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
        title="Gửi ảnh"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default ImageAttachmentButton;
