"use client";

import React, { useState, useRef } from "react";
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import Button from "@/components/ui/Button/Button";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { ImageIcon, X, AlertCircle, Loader2, Zap, Plus } from "lucide-react";
import { useGlobalData } from "@/contexts/GlobalDataContext";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import {
  optimizeImageForUpload,
  validateImageFile,
  formatFileSize,
  getImageDimensions
} from "@/utils/imageCompression";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalFile?: File;
  compressionStats?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: string;
  };
}

interface CreatePostCardProps {
  userName?: string;
  userAvatar?: string | null;
  placeholder?: string;
}

export default function CreatePostCard({
  userName = "User",
  userAvatar,
  placeholder
}: CreatePostCardProps) {
  const [postContent, setPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compressingImageId, setCompressingImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addPost } = useGlobalData();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const MAX_IMAGES = 10;

  // Handle form submission
  const handleSubmit = async () => {
    if (!postContent.trim() && selectedImages.length === 0) {
      setUploadError(t('createPost.errors.contentRequired'));
      return;
    }

    setIsLoading(true);
    setUploadError(null);

    try {
      console.log('Creating post with data:', {
        content: postContent.trim(),
        imageCount: selectedImages.length,
        totalImageSize: selectedImages.reduce((sum, img) => sum + img.file.size, 0),
        imageTypes: selectedImages.map(img => img.file.type)
      });

      const result = await addPost({
        content: postContent.trim(),
        images: selectedImages.length > 0 ? selectedImages.map(img => img.file) : undefined,
      });

      console.log('Post created successfully:', result);

      // Reset form after successful creation
      setPostContent("");
      removeAllImages();
    } catch (error) {
      console.error("Error creating post:", error);
      setUploadError(t('createPost.errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !isLoading && !isCompressing) {
      handleSubmit();
    }
  };

  // Handle multiple image selection with compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError(null);

    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (selectedImages.length + files.length > MAX_IMAGES) {
      setUploadError(t('createPost.errors.maxImages').replace('{{max}}', String(MAX_IMAGES)).replace('{{current}}', String(selectedImages.length)));
      return;
    }

    setIsCompressing(true);

    try {
      const processedImages: ImageFile[] = [];

      for (const file of files) {
        const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setCompressingImageId(imageId);

        // Validate file first
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          console.warn(`Invalid image file: ${file.name} - ${validation.error}`);
          continue;
        }

        try {
          // Get original image dimensions for logging
          const dimensions = await getImageDimensions(file);
          console.log('📸 Processing image:', {
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            dimensions: `${dimensions.width}x${dimensions.height}`
          });

          // Compress the image
          const compressedFile = await optimizeImageForUpload(file, 'post');

          // Calculate compression stats
          let compressionStats;
          if (compressedFile !== file) {
            const ratio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
            compressionStats = {
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: ratio
            };
          }

          // Create preview from compressed file
          const preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
          });

          processedImages.push({
            id: imageId,
            file: compressedFile,
            preview,
            originalFile: file,
            compressionStats
          });

        } catch (error) {
          console.error(`Failed to process image ${file.name}:`, error);
        }
      }

      setSelectedImages(prev => [...prev, ...processedImages]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Image processing failed:', error);
      setUploadError(t('createPost.errors.processingFailed'));
    } finally {
      setIsCompressing(false);
      setCompressingImageId(null);
    }
  };

  // Remove specific image
  const removeImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    setUploadError(null);
  };

  // Remove all images
  const removeAllImages = () => {
    setSelectedImages([]);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <BaseCard variant="compact" title="">
      <div className="flex gap-3">
        <UserAvatar
          name={userName}
          avatar={userAvatar || undefined}
          size="md"
          variant="circle"
        />
        <div className="flex-1">
          <label htmlFor="post-content" className="sr-only">
            {t('createPost.labels.postContent')}
          </label>
          <textarea
            id="post-content"
            placeholder={placeholder || t('createPost.placeholder')}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none transition-all duration-200"
            style={{
              backgroundColor: theme.background.secondary,
              color: theme.text.primary,
              borderColor: theme.border.default,
              '--tw-ring-color': '#3b82f6',
            } as React.CSSProperties & { '--tw-ring-color': string }}
            rows={3}
            aria-describedby="post-content-hint"
            disabled={isLoading || isCompressing}
          />
          <div id="post-content-hint" className="sr-only">
            {t('createPost.hints.ctrlEnter')}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mt-3 p-3 border rounded-lg flex items-center gap-2"
             style={{
               backgroundColor: theme.background.secondary,
               borderColor: '#ef4444',
               color: '#ef4444'
             }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0"/>
          <span className="text-sm">{uploadError}</span>
        </div>
      )}

      {/* Image Compression Progress */}
      {isCompressing && (
        <div className="mt-3 p-3 border rounded-lg flex items-center gap-2"
             style={{
               backgroundColor: theme.background.secondary,
               borderColor: '#3b82f6',
               color: '#3b82f6'
             }}>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0"/>
          <span className="text-sm">{t('createPost.status.processing')}</span>
        </div>
      )}

      {/* Multiple Images Preview */}
      {selectedImages.length > 0 && !isCompressing && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: theme.text.muted }}>
              {t('createPost.images.selected').replace('{{count}}', String(selectedImages.length))}
            </span>
            {selectedImages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeAllImages}
                className="text-xs"
                style={{ color: '#ef4444' }}
                disabled={isLoading}
              >
                {t('createPost.actions.removeAll')}
              </Button>
            )}
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {selectedImages.map((imageFile) => (
              <div key={imageFile.id} className="relative group">
                <div className="relative aspect-square">
                  <img
                    src={imageFile.preview}
                    alt={t('createPost.images.previewAlt').replace('{{name}}', imageFile.file.name)}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(imageFile.id)}
                    className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white'
                    }}
                    aria-label={t('createPost.images.removeAlt').replace('{{name}}', imageFile.file.name)}
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Image Info */}
                <div className="mt-1 text-xs truncate" style={{ color: theme.text.muted }}>
                  {imageFile.file.name}
                </div>
                <div className="text-xs" style={{ color: theme.text.muted }}>
                  {formatFileSize(imageFile.file.size)}
                </div>

                {/* Compression Stats */}
                {imageFile.compressionStats && (
                  <div className="flex items-center gap-1 text-xs mt-1" style={{ color: '#10b981' }}>
                    <Zap className="w-2 h-2" />
                    <span className="truncate">
                      -{imageFile.compressionStats.compressionRatio}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border.default}` }}>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              multiple
              className="sr-only"
              id="image-upload"
              disabled={isLoading || isCompressing || selectedImages.length >= MAX_IMAGES}
              aria-describedby="image-upload-hint"
            />
            <div id="image-upload-hint" className="sr-only">
              {t('createPost.hints.imageUpload').replace('{{max}}', String(MAX_IMAGES))}
            </div>
            <label
              htmlFor="image-upload"
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                isLoading || isCompressing || selectedImages.length >= MAX_IMAGES
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              style={{
                backgroundColor: isLoading || isCompressing || selectedImages.length >= MAX_IMAGES
                  ? theme.background.muted
                  : theme.background.secondary,
                color: isLoading || isCompressing || selectedImages.length >= MAX_IMAGES
                  ? theme.text.muted
                  : '#10b981'
              }}
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin"/>
                  {t('createPost.status.processing')}
                </>
              ) : selectedImages.length >= MAX_IMAGES ? (
                <>
                  <ImageIcon className="w-5 h-5 mr-2"/>
                  {t('createPost.actions.maxImages')}
                </>
              ) : selectedImages.length > 0 ? (
                <>
                  <Plus className="w-5 h-5 mr-2"/>
                  {t('createPost.actions.addMore')}
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 mr-2"/>
                  {t('createPost.actions.photos')}
                </>
              )}
            </label>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={isLoading || isCompressing || (!postContent.trim() && selectedImages.length === 0)}
          className="min-w-[80px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2"/>
              {t('createPost.status.posting')}
            </>
          ) : (
            t('createPost.actions.post')
          )}
        </Button>
      </div>
    </BaseCard>
  );
}
