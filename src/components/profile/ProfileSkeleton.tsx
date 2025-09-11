import React from 'react';
import { DARK_THEME } from '@/constants/theme';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Cover Photo Skeleton */}
      <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse"></div>

      {/* Profile Info Skeleton */}
      <div
        className="relative px-4 sm:px-6 pb-4 sm:pb-6 -mt-12 sm:-mt-16"
        style={{ backgroundColor: DARK_THEME.background.primary }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-4 sm:space-y-0 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar Skeleton */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-700 animate-pulse self-center sm:self-auto"></div>

            {/* Info Skeleton */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-700 rounded animate-pulse mx-auto sm:mx-0"></div>
              <div className="h-4 w-24 sm:w-32 bg-gray-700 rounded animate-pulse mx-auto sm:mx-0"></div>
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="h-8 sm:h-10 w-24 sm:w-32 bg-gray-700 rounded animate-pulse mx-auto sm:mx-0"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-gray-700 px-4 sm:px-6">
        <div className="flex space-x-4 sm:space-x-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-16 sm:w-20 bg-gray-700 rounded animate-pulse my-4"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
