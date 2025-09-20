"use client";

import React from 'react';
import { DARK_THEME } from '@/constants/theme';
import type { TimelineLoadingSkeletonProps } from './types';

// Loading skeleton component
export default function TimelineLoadingSkeleton({ count = 3 }: TimelineLoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <div
            className="w-3 h-3 rounded-full animate-pulse flex-shrink-0 mt-1"
            style={{ backgroundColor: DARK_THEME.background.muted }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 rounded animate-pulse w-3/4"
              style={{ backgroundColor: DARK_THEME.background.muted }}
            />
            <div
              className="h-3 rounded animate-pulse w-full"
              style={{ backgroundColor: DARK_THEME.background.muted }}
            />
            <div
              className="h-3 rounded animate-pulse w-1/2"
              style={{ backgroundColor: DARK_THEME.background.muted }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
