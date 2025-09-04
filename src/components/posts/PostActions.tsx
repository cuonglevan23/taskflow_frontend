"use client";

import React from "react";
import Button from "@/components/ui/Button/Button";
import { Heart, MessageCircle, Share } from "lucide-react";

interface PostActionsProps {
  likes: number;
  comments: number;
  shares?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  showShareCount?: boolean;
}

export default function PostActions({
  likes,
  comments,
  shares = 0,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  showShareCount = false
}: PostActionsProps) {
  // Ensure numbers are valid and not NaN
  const safeLikes = typeof likes === 'number' && !isNaN(likes) ? likes : 0;
  const safeComments = typeof comments === 'number' && !isNaN(comments) ? comments : 0;
  const safeShares = typeof shares === 'number' && !isNaN(shares) ? shares : 0;

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-600">
      <div className="flex gap-6">
        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
          <span className="font-medium">{safeLikes}</span>
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="text-gray-400 hover:text-blue-400 flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{safeComments}</span>
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="text-gray-400 hover:text-green-400 flex items-center gap-2"
        >
          <Share className="w-5 h-5" />
          {showShareCount ? <span className="font-medium">{safeShares}</span> : <span>Share</span>}
        </Button>
      </div>
    </div>
  );
}
