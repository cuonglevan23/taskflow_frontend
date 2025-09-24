import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

export const ProfileSkeleton: React.FC = () => {
  const { theme } = useThemeContext();


  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Cover Photo Skeleton */}
      <div
        className="h-48 sm:h-56 md:h-64 lg:h-72 w-full animate-pulse"
        style={{
          background: `linear-gradient(to bottom right, ${theme.background.muted}, ${theme.background.secondary})`
        }}
      ></div>

      {/* Profile Info Skeleton */}
      <div
        className="relative px-4 sm:px-6 pb-4 sm:pb-6 -mt-12 sm:-mt-16"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-4 sm:space-y-0 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar Skeleton */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full animate-pulse self-center sm:self-auto"
              style={{ backgroundColor: theme.background.muted }}
            ></div>

            {/* Info Skeleton */}
            <div className="space-y-2 text-center sm:text-left">
              <div
                className="h-6 sm:h-8 w-32 sm:w-48 rounded animate-pulse mx-auto sm:mx-0"
                style={{ backgroundColor: theme.background.muted }}
              ></div>
              <div
                className="h-4 w-24 sm:w-32 rounded animate-pulse mx-auto sm:mx-0"
                style={{ backgroundColor: theme.background.muted }}
              ></div>
            </div>
          </div>

          {/* Button Skeleton */}
          <div
            className="h-8 sm:h-10 w-24 sm:w-32 rounded animate-pulse mx-auto sm:mx-0"
            style={{ backgroundColor: theme.background.muted }}
          ></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div
        className="border-b px-4 sm:px-6"
        style={{ borderColor: theme.border.default }}
      >
        <div className="flex space-x-4 sm:space-x-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 w-16 sm:w-20 rounded animate-pulse my-4"
              style={{ backgroundColor: theme.background.muted }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
