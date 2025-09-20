"use client";

import React from "react";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { CheckCircle, Edit, Pin } from "lucide-react";
import { usePostManagement } from "@/hooks/posts";
import { PostData } from "@/types/post";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface PostHeaderProps {
  post: PostData;
  authorName: string;
  authorAvatar?: string | null;
  isPremium?: boolean;
  timestamp: string;
  onAuthorClick?: () => void;
  onEdit?: () => void;
}

export default function PostHeader({
  post,
  authorName,
  authorAvatar,
  isPremium = false,
  timestamp,
  onAuthorClick,
  onEdit
}: PostHeaderProps) {
  const { canEditPost } = usePostManagement();
  const { themeMode } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get nested message value
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const isDark = themeMode === 'dark';

  return (
    <div className="flex items-center gap-3 mb-3">
      <UserAvatar
        name={authorName}
        avatar={authorAvatar}
        size="md"
        variant="circle"
        onClick={onAuthorClick}
        className={onAuthorClick ? "cursor-pointer hover:opacity-80" : ""}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4
            className={`font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            } ${onAuthorClick ? 'cursor-pointer hover:underline' : ''}`}
            onClick={onAuthorClick}
          >
            {authorName}
          </h4>
          {isPremium && (
            <div
              className="flex items-center justify-center w-4 h-4 rounded-full shadow-md bg-blue-500"
              title={t('postHeader.verified')}
            >
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Pin indicator */}
          {post.isPinned && (
            <div
              className="flex items-center space-x-1"
              title={t('postHeader.pinnedPostTitle')}
            >
              <Pin className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400">{t('postHeader.pinned')}</span>
            </div>
          )}

          {/* Quick edit button for post author */}
          {canEditPost(post) && onEdit && (
            <button
              onClick={onEdit}
              className={`p-1 rounded-full transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
              }`}
              title={t('postHeader.editPost')}
            >
              <Edit className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>{timestamp}</p>
      </div>
    </div>
  );
}
