import imageCompression from 'browser-image-compression';

// Image compression configuration
export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

// Default compression settings for different use cases
export const COMPRESSION_PRESETS = {
  // For post images - balance between quality and size
  POST_IMAGE: {
    maxSizeMB: 1.5, // Max 1.5MB
    maxWidthOrHeight: 1920, // Max dimension 1920px
    useWebWorker: true,
    fileType: 'image/jpeg', // Convert to JPEG for better compression
    initialQuality: 0.8, // 80% quality
  },

  // For avatar images - smaller size, good quality
  AVATAR: {
    maxSizeMB: 0.5, // Max 500KB
    maxWidthOrHeight: 400, // Max dimension 400px
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.85, // 85% quality for avatars
  },

  // For thumbnails - very small size
  THUMBNAIL: {
    maxSizeMB: 0.2, // Max 200KB
    maxWidthOrHeight: 300, // Max dimension 300px
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7, // 70% quality
  },

  // High quality for documents/screenshots
  DOCUMENT: {
    maxSizeMB: 2, // Max 2MB
    maxWidthOrHeight: 2560, // Max dimension 2560px
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.9, // 90% quality
  }
} as const;

/**
 * Compress an image file with specified options
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = COMPRESSION_PRESETS.POST_IMAGE
): Promise<File> {
  try {
    console.log('🔄 Starting image compression...', {
      originalName: file.name,
      originalSize: formatFileSize(file.size),
      originalType: file.type,
      targetOptions: options
    });

    const compressedFile = await imageCompression(file, options);

    const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);

    console.log('✅ Image compression completed:', {
      originalSize: formatFileSize(file.size),
      compressedSize: formatFileSize(compressedFile.size),
      compressionRatio: `${compressionRatio}%`,
      newType: compressedFile.type
    });

    return compressedFile;
  } catch (error) {
    console.error('❌ Image compression failed:', error);
    throw new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a file needs compression based on size and format
 */
export function shouldCompressImage(file: File, maxSizeMB: number = 1.5): boolean {
  const sizeMB = file.size / 1024 / 1024;
  const isCompressibleFormat = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);

  return isCompressibleFormat && sizeMB > maxSizeMB;
}

/**
 * Get optimal compression preset based on use case
 */
export function getCompressionPreset(useCase: 'post' | 'avatar' | 'thumbnail' | 'document' = 'post'): CompressionOptions {
  switch (useCase) {
    case 'avatar':
      return COMPRESSION_PRESETS.AVATAR;
    case 'thumbnail':
      return COMPRESSION_PRESETS.THUMBNAIL;
    case 'document':
      return COMPRESSION_PRESETS.DOCUMENT;
    case 'post':
    default:
      return COMPRESSION_PRESETS.POST_IMAGE;
  }
}

/**
 * Compress image with automatic format optimization
 */
export async function optimizeImageForUpload(
  file: File,
  useCase: 'post' | 'avatar' | 'thumbnail' | 'document' = 'post'
): Promise<File> {
  const preset = getCompressionPreset(useCase);

  // Check if compression is needed
  if (!shouldCompressImage(file, preset.maxSizeMB)) {
    console.log('ℹ️ Image compression skipped - file is already optimized');
    return file;
  }

  return compressImage(file, preset);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validate image file before compression
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPG, PNG, GIF, or WebP)'
    };
  }

  // Check file size (max 20MB before compression)
  const maxSizeBeforeCompression = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSizeBeforeCompression) {
    return {
      isValid: false,
      error: 'Image file is too large. Please select an image smaller than 20MB.'
    };
  }

  return { isValid: true };
}
