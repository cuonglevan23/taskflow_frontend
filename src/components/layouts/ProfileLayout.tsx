"use client";

import React from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import PrivateLayout from "@/layouts/private/PrivateLayout";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
// @ts-ignore
import type { AuthUser } from "@/lib/auth/types";

interface ProfileLayoutProps {
  children: React.ReactNode;
  user?: AuthUser | null;
  title?: string;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
  // Legacy support for custom avatar
  customAvatar?: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  children,
  user,
  title = "Profile",
  subtitle,
  headerActions,
  className = "",
  customAvatar,
}) => {
  const { theme } = useThemeContext();

  // Use proper UserAvatar component or fallback to custom avatar
  const avatarElement = customAvatar || (
    <UserAvatar
      user={user}
      size="xl"
      variant="circle"
      showTooltip={false}
      className="shadow-lg"
    />
  );

  return (
    <PrivateLayout>
      <div
        className={`min-h-screen ${className}`}
        style={{
          backgroundColor: theme.background.primary,
        }}
      >
        {/* Header Section */}
        <div
          className="sticky top-0 z-50 border-b"
          style={{
            backgroundColor: theme.background.primary,
            borderBottomColor: theme.border.default,
          }}
        >
          <div className="px-6 py-6">
            {/* Header Content - Responsive container */}
            <div className="max-w-7xl mx-auto">
              <div className="flex items-start gap-6">
                {/* Left Div: Avatar Only */}
                <div className="flex-shrink-0">
                  {avatarElement}
                </div>

                {/* Right Div: User Info + Edit Button */}
                <div className="flex-1 flex flex-col">
                  {/* User Information Section */}
                  <div className="flex flex-col">
                    <h1
                      className="text-2xl font-semibold"
                      style={{ color: theme.text.primary }}
                    >
                      {title || user?.name || "Profile"}
                    </h1>
                    {subtitle && (
                      <div className="mt-1">
                        {subtitle}
                      </div>
                    )}
                  </div>

                  {/* Edit Profile Button - Below about me */}
                  {headerActions && (
                    <div className="flex items-center gap-2 mt-4">
                      {headerActions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default ProfileLayout;
