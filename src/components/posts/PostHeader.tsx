"use client";

import React from "react";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { CheckCircle } from "lucide-react";

interface PostHeaderProps {
  authorName: string;
  authorAvatar?: string | null;
  isPremium?: boolean;
  timestamp: string;
  onAuthorClick?: () => void;
}

export default function PostHeader({
  authorName,
  authorAvatar,
  isPremium = false,
  timestamp,
  onAuthorClick
}: PostHeaderProps) {
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
            className={`font-semibold text-white ${onAuthorClick ? 'cursor-pointer hover:underline' : ''}`}
            onClick={onAuthorClick}
          >
            {authorName}
          </h4>
          {isPremium && (
            <div
              className="flex items-center justify-center w-4 h-4 rounded-full shadow-md"
              style={{ backgroundColor: '#1DA1F2' }}
              title="Verified"
            >
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-gray-400 text-sm">{timestamp}</p>
      </div>
    </div>
  );
}
