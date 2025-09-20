import { useMemo } from 'react';

export interface ImageItem {
  id: string | number;
  url: string;
  alt?: string;
}

export interface LayoutImageItem extends ImageItem {
  isOverlay?: boolean;
  overlayCount?: number;
  gridPosition: {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
  };
  aspectRatio: 'square' | 'wide' | 'tall';
  className: string;
}

export interface GalleryLayout {
  rows: LayoutImageItem[][];
  totalImages: number;
  visibleImages: number;
  hasOverlay: boolean;
}

/**
 * Hook for calculating Facebook-style gallery layout
 * Facebook rules:
 * - Maximum 4 images displayed
 * - Always overlay on last image if there are more
 * - 1 image: full width
 * - 2 images: side by side
 * - 3 images: 2 top + 1 bottom (full width)
 * - 4+ images: 2 top + 2 bottom (overlay on 4th image if more than 4)
 */
export function useGalleryLayout(images: ImageItem[]): GalleryLayout {
  return useMemo(() => {
    const totalImages = images.length;

    if (totalImages === 0) {
      return {
        rows: [],
        totalImages: 0,
        visibleImages: 0,
        hasOverlay: false,
      };
    }

    // Single image - full width
    if (totalImages === 1) {
      const layoutImage: LayoutImageItem = {
        ...images[0],
        gridPosition: { row: 0, col: 0, rowSpan: 1, colSpan: 2 },
        aspectRatio: 'wide',
        className: 'col-span-2 aspect-[16/10] cursor-pointer',
      };

      return {
        rows: [[layoutImage]],
        totalImages,
        visibleImages: 1,
        hasOverlay: false,
      };
    }

    // Two images - side by side
    if (totalImages === 2) {
      const layoutImages: LayoutImageItem[] = images.map((img, index) => ({
        ...img,
        gridPosition: { row: 0, col: index, rowSpan: 1, colSpan: 1 },
        aspectRatio: 'square',
        className: 'aspect-square cursor-pointer',
      }));

      return {
        rows: [layoutImages],
        totalImages,
        visibleImages: 2,
        hasOverlay: false,
      };
    }

    // Three images - 2 top, 1 bottom (full width)
    if (totalImages === 3) {
      const topRow: LayoutImageItem[] = images.slice(0, 2).map((img, index) => ({
        ...img,
        gridPosition: { row: 0, col: index, rowSpan: 1, colSpan: 1 },
        aspectRatio: 'square',
        className: 'aspect-square cursor-pointer',
      }));

      const bottomRow: LayoutImageItem[] = [{
        ...images[2],
        gridPosition: { row: 1, col: 0, rowSpan: 1, colSpan: 2 },
        aspectRatio: 'wide',
        className: 'col-span-2 aspect-[16/9] cursor-pointer',
      }];

      return {
        rows: [topRow, bottomRow],
        totalImages,
        visibleImages: 3,
        hasOverlay: false,
      };
    }

    // Four or more images - 2 top + 2 bottom, overlay on 4th if more than 4
    const topRow: LayoutImageItem[] = images.slice(0, 2).map((img, index) => ({
      ...img,
      gridPosition: { row: 0, col: index, rowSpan: 1, colSpan: 1 },
      aspectRatio: 'square',
      className: 'aspect-square cursor-pointer',
    }));

    // Bottom row: 2 images, overlay on last if more than 4 total
    const bottomImages = images.slice(2, 4);
    const hasOverlay = totalImages > 4;
    const overlayCount = totalImages - 4;

    const bottomRow: LayoutImageItem[] = bottomImages.map((img, index) => {
      const isLast = index === 1; // Second image in bottom row (4th overall)

      return {
        ...img,
        gridPosition: { row: 1, col: index, rowSpan: 1, colSpan: 1 },
        aspectRatio: 'square',
        className: `aspect-square cursor-pointer ${isLast && hasOverlay ? 'relative' : ''}`,
        isOverlay: isLast && hasOverlay,
        overlayCount: isLast && hasOverlay ? overlayCount : 0,
      };
    });

    return {
      rows: [topRow, bottomRow],
      totalImages,
      visibleImages: 4,
      hasOverlay,
    };
  }, [images]);
}

/**
 * Get grid container classes based on layout
 */
export function useGridContainerClasses(layout: GalleryLayout): string {
  const baseClasses = 'mt-3 gap-1 rounded-lg overflow-hidden';

  if (layout.totalImages === 1) {
    return `${baseClasses} grid grid-cols-1`;
  }

  if (layout.totalImages === 2) {
    return `${baseClasses} grid grid-cols-2`;
  }

  // For 3+ images, use flexible grid
  return `${baseClasses} grid grid-cols-2 auto-rows-min`;
}
