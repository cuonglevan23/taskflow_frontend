"use client";

import React, { useState, useRef } from "react";
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import Button from "@/components/ui/Button/Button";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { ImageIcon, Smile, X, AlertCircle, Loader2, Zap } from "lucide-react";
import { useCreatePost } from "@/hooks/usePosts";
import {
  optimizeImageForUpload,
  validateImageFile,
  formatFileSize,
  getImageDimensions
} from "@/utils/imageCompression";

interface CreatePostCardProps {
  userName?: string;
  userAvatar?: string | null;
  placeholder?: string;
}

export default function CreatePostCard({
  userName = "User",
  userAvatar,
  placeholder = "What's on your mind?"
}: CreatePostCardProps) {
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createPost } = useCreatePost();

  // Handle form submission
  const handleSubmit = async () => {
    if (!postContent.trim() && !selectedImage) {
      setUploadError("Please write something or add an image");
      return;
    }

    setIsLoading(true);
    setUploadError(null);

    try {
      console.log('Creating post with data:', {
        content: postContent.trim(),
        hasImage: !!selectedImage,
        imageSize: selectedImage ? selectedImage.size : 0,
        imageType: selectedImage ? selectedImage.type : null,
        isCompressed: !!compressionStats
      });

      const result = await createPost({
        content: postContent.trim(),
        image: selectedImage || undefined,
      });

      console.log('Post created successfully:', result);

      // Reset form after successful creation
      setPostContent("");
      removeImage();
    } catch (error) {
      console.error("Error creating post:", error);
      setUploadError("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !isLoading && !isCompressing) {
      handleSubmit();
    }
  };

  // Handle image selection with compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    setCompressionStats(null);

    if (!file) return;

    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || "Invalid image file");
      return;
    }

    setOriginalImage(file);
    setIsCompressing(true);

    try {
      // Get original image dimensions for logging
      const dimensions = await getImageDimensions(file);
      console.log('📸 Original image info:', {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        dimensions: `${dimensions.width}x${dimensions.height}`
      });

      // Compress the image
      const compressedFile = await optimizeImageForUpload(file, 'post');

      // Calculate compression stats
      if (compressedFile !== file) {
        const ratio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
        setCompressionStats({
          originalSize: file.size,
          compressedSize: compressedFile.size,
          compressionRatio: ratio
        });
      }

      // Create preview from compressed file
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      setSelectedImage(compressedFile);
    } catch (error) {
      console.error('Image compression failed:', error);
      setUploadError("Failed to process image. Please try a different image.");
    } finally {
      setIsCompressing(false);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setOriginalImage(null);
    setImagePreview(null);
    setUploadError(null);
    setCompressionStats(null);
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
            Post content
          </label>
          <textarea
            id="post-content"
            placeholder={placeholder}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full bg-gray-700 border-0 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={3}
            aria-describedby="post-content-hint"
            disabled={isLoading || isCompressing}
          />
          <div id="post-content-hint" className="sr-only">
            Press Ctrl+Enter to post quickly
          </div>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-red-300 text-sm">{uploadError}</span>
        </div>
      )}

      {/* Image Compression Progress */}
      {isCompressing && (
        <div className="mt-3 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
          <span className="text-blue-300 text-sm">Optimizing image...</span>
        </div>
      )}

      {/* Image Preview */}
      {selectedImage && imagePreview && !isCompressing && (
        <div className="mt-3 relative">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt={`Preview: ${selectedImage.name}`}
              className="max-h-64 max-w-full rounded-lg object-cover shadow-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/90 w-8 h-8 p-0 rounded-full"
              aria-label="Remove selected image"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Image Info */}
          <div className="mt-2 space-y-1">
            <div className="text-xs text-gray-400">
              {selectedImage.name} ({formatFileSize(selectedImage.size)})
            </div>

            {/* Compression Stats */}
            {compressionStats && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <Zap className="w-3 h-3" />
                <span>
                  Optimized: {formatFileSize(compressionStats.originalSize)} → {formatFileSize(compressionStats.compressedSize)}
                  ({compressionStats.compressionRatio}% smaller)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              className="sr-only"
              id="image-upload"
              disabled={isLoading || isCompressing}
              aria-describedby="image-upload-hint"
            />
            <div id="image-upload-hint" className="sr-only">
              Upload an image (JPG, PNG, GIF, WebP - will be optimized automatically)
            </div>
            <label
              htmlFor="image-upload"
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 rounded ${
                isLoading || isCompressing
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Photo
                </>
              )}
            </label>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => console.log("Feeling clicked")}
            disabled={isLoading || isCompressing}
          >
            <Smile className="w-5 h-5 mr-2" />
            Feeling
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={isLoading || isCompressing || (!postContent.trim() && !selectedImage)}
          className="min-w-[80px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </Button>
      </div>
    </BaseCard>
  );
}
