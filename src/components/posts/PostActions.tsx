"use client";

import React from "react";
import { Heart, MessageCircle } from "lucide-react";
import { PostData } from "@/types/post";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface PostActionsProps {
  post: PostData;
  onLike: () => void;
  onComment: () => void;
  onShare?: () => void;
  showShareCount?: boolean;
}

export default function PostActions({
  post,
  onLike,
  onComment,
}: PostActionsProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  return (
    <div
      className="border-t pt-3"
      style={{ borderColor: theme.border.default }}
    >
      {/* Stats */}
      <div
        className="flex items-center justify-between mb-3 text-sm"
        style={{ color: theme.text.muted }}
      >
        <div className="flex items-center space-x-4">
          {post.likesCount > 0 && (
            <span className="flex items-center space-x-1">
              <span className="text-red-500">❤️</span>
              <span>{post.likesCount}</span>
            </span>
          )}
          {post.commentsCount > 0 && (
            <span>
              {post.commentsCount} {t("postActions.comments")}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 min-w-0">
        {/* Like Button */}
        <button
          onClick={onLike}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          style={{
            backgroundColor: "transparent",
            color: post.isLikedByCurrentUser ? "#ef4444" : theme.text.muted,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.weakHover;
            if (!post.isLikedByCurrentUser) {
              e.currentTarget.style.color = "#ef4444";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = post.isLikedByCurrentUser
              ? "#ef4444"
              : theme.text.muted;
          }}
          aria-label={
            post.isLikedByCurrentUser
              ? t("postActions.unlike")
              : t("postActions.like")
          }
        >
          <Heart
            className={`w-5 h-5 ${
              post.isLikedByCurrentUser ? "fill-current" : ""
            }`}
          />
          <span className="text-sm font-medium">
            {post.isLikedByCurrentUser
              ? t("postActions.liked")
              : t("postActions.like")}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={onComment}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          style={{
            backgroundColor: "transparent",
            color: theme.text.muted,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.background.weakHover;
            e.currentTarget.style.color = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = theme.text.muted;
          }}
          aria-label={t("postActions.comment")}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            {t("postActions.comment")}
          </span>
        </button>
      </div>
    </div>
  );
}
