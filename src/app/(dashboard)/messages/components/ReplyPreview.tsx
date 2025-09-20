import React from 'react';
import { useThemeContext } from "@/providers/ThemeProvider";

interface ReplyPreviewProps {
  content: string;
  senderName: string;
  isOwn: boolean;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  content,
  senderName,
  isOwn
}) => {
  // Theme and Language Context
  const { theme } = useThemeContext();

  return (
    <div
      className="mb-2 p-2 rounded-lg border-l-4 text-sm max-w-full"
      style={{
        backgroundColor: isOwn
          ? 'rgba(255, 255, 255, 0.1)'
          : theme.background.muted,
        borderLeftColor: theme.status.info,
        color: theme.text.muted
      }}
    >
      <div className="flex items-center gap-1 mb-1">
        <svg
          className="w-3 h-3 flex-shrink-0"
          style={{ color: theme.status.info }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
        </svg>
        <span className="font-medium text-xs" style={{ color: theme.status.info }}>
          {senderName}
        </span>
      </div>
      <div className="line-clamp-2 break-words text-xs">
        {content}
      </div>
    </div>
  );
};

export default ReplyPreview;
