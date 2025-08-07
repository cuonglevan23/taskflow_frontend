"use client";

import React from 'react';
import { ProjectFile } from '../context/ProjectFilesContext';
import { ImageAssets } from '@/utils/imageAssets';

interface FileIconProps {
  file: ProjectFile;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FileIcon({ file, size = 'md', className = '' }: FileIconProps) {
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  const getFileIcon = (file: ProjectFile) => {
    // Try to use the helper function from ImageAssets first
    const iconPath = ImageAssets.helpers.getFileIcon(file.type);
    
    // For custom SVG icons, render as image
    if (iconPath.endsWith('.svg')) {
      return (
        <img 
          src={iconPath} 
          alt={`${file.type} file icon`}
          className={`${getIconSize()} ${className}`}
          onError={(e) => {
            // Fallback to gradient background if SVG fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    const type = file.type.toLowerCase();
    const mimeType = file.mimeType.toLowerCase();
    
    // Image files - show thumbnail or image icon
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type) || mimeType.startsWith('image/')) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // PDF files
    if (type === 'pdf' || mimeType === 'application/pdf') {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
      );
    }

    // Document files
    if (['doc', 'docx'].includes(type) || mimeType.includes('document')) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // Spreadsheet files
    if (['xls', 'xlsx', 'csv'].includes(type) || mimeType.includes('spreadsheet')) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v2h2V6H5zm4 0v2h2V6H9zm4 0v2h2V6h-2zM5 10v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2zM5 14v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // Video files
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(type) || mimeType.startsWith('video/')) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        </div>
      );
    }

    // Audio files
    if (['mp3', 'wav', 'flac', 'aac'].includes(type) || mimeType.startsWith('audio/')) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
        </div>
      );
    }

    // Code files
    if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'scss', 'json'].includes(type)) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // Text files
    if (['txt', 'md', 'rtf'].includes(type) || mimeType.startsWith('text/')) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // Database files
    if (['sql', 'db', 'sqlite'].includes(type)) {
      return (
        <div className={`${getIconSize()} ${className} bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center`}>
          <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
          </svg>
        </div>
      );
    }

    // Default file icon
    return (
      <div className={`${getIconSize()} ${className} bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center`}>
        <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  return getFileIcon(file);
}