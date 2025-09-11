"use client";

import React from "react";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { PostData } from "@/types/post";

interface PostActionsProps {
  post: PostData;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  showShareCount?: boolean;
}

export default function PostActions({
  post,
  onLike,
  onComment,


}: PostActionsProps) {
  return (
    <div className="border-t border-gray-700 pt-3">
      {/* Stats */}
      <div className="flex items-center justify-between mb-3 text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          {post.likesCount > 0 && (
            <span className="flex items-center space-x-1">
              <span className="text-red-500">❤️</span>
              <span>{post.likesCount}</span>
            </span>
          )}
          {post.commentsCount > 0 && (
            <span>{post.commentsCount} bình luận</span>
          )}
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {/* Like Button */}
          <button
            onClick={onLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-700 ${
              post.isLikedByCurrentUser 
                ? 'text-red-500' 
                : 'text-gray-400 hover:text-red-400'
            }`}
            aria-label={post.isLikedByCurrentUser ? 'Bỏ thích' : 'Thích'}
          >
            <Heart
              className={`w-5 h-5 ${post.isLikedByCurrentUser ? 'fill-current' : ''}`}
            />
            <span className="text-sm font-medium">
              {post.isLikedByCurrentUser ? 'Đã thích' : 'Thích'}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={onComment}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-700 text-gray-400 hover:text-blue-400"
            aria-label="Bình luận"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Bình luận</span>
          </button>


        </div>

        {/* More Actions */}
        <button
          className="p-2 rounded-lg transition-colors hover:bg-gray-700 text-gray-400 hover:text-gray-300"
          aria-label="Thêm tùy chọn"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
