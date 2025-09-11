import React, { memo, useState, useRef, useCallback } from 'react';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';
import { ChatMessage, ReactionType } from '@/types/chat';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

// Import các components con
const MessageActions = React.lazy(() => import('./MessageActions'));
const ReactionMenu = React.lazy(() => import('./ReactionMenu'));
const ReactionBadge = React.lazy(() => import('./ReactionBadge'));
const ReplyPreview = React.lazy(() => import('./ReplyPreview'));

// Format time utility
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Utility function to get file icon based on type
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎬';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('doc')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
  return '📎';
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File attachment component - Exact same approach as FileDisplayGrid
const FileAttachment = ({ message }: { message: ChatMessage }) => {
  if (!message.fileUrl || !message.fileName) return null;

  const isImage = message.type === 'IMAGE' || message.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/);
  const isVideo = message.type === 'VIDEO' || message.fileName?.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi)$/);

  const handleDownload = () => {
    if (message.fileUrl) {
      window.open(message.fileUrl, '_blank');
    }
  };

  // Image preview - EXACT same approach as FileDisplayGrid
  if (isImage) {
    return (
      <div className="mt-2 max-w-xs">
        <div className="aspect-video bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative group rounded-lg overflow-hidden">
          <img
            src={message.fileUrl}
            alt={message.fileName}
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleDownload}
            onError={(e) => {
              // Exact same fallback as FileDisplayGrid
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />

          {/* Fallback icon when image fails - hidden by default */}
          <div className="hidden w-12 h-12 text-gray-400 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Hover overlay - exact same as FileDisplayGrid */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
        </div>

        {/* File name */}
        <p className="text-xs mt-1 opacity-75 truncate">{message.fileName}</p>
      </div>
    );
  }

  // Video preview
  if (isVideo) {
    return (
      <div className="mt-2 max-w-xs">
        <div className="relative rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-auto max-h-60 rounded-lg"
            preload="metadata"
          >
            <source src={message.fileUrl} />
            Your browser does not support the video tag.
          </video>
        </div>
        {message.fileName && (
          <p className="text-xs mt-1 opacity-75 truncate">{message.fileName}</p>
        )}
      </div>
    );
  }

  // Generic file attachment
  return (
    <div className="mt-2">
      <div
        className="flex items-center gap-3 p-3 rounded-lg border border-opacity-20 hover:border-opacity-40 transition-all duration-200 cursor-pointer max-w-xs"
        style={{
          backgroundColor: `${DARK_THEME.background.muted}40`,
          borderColor: DARK_THEME.border.default
        }}
        onClick={handleDownload}
      >
        <div className="text-2xl flex-shrink-0">
          {getFileIcon(message.fileName || '')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: DARK_THEME.text.primary }}>
            {message.fileName}
          </p>
          {message.fileSize && (
            <p className="text-xs opacity-75" style={{ color: DARK_THEME.text.muted }}>
              {formatFileSize(message.fileSize)}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  currentUserId?: number;
  onToggleReaction: (messageId: number, reactionType: ReactionType) => void;
  onReply?: (message: ChatMessage) => void;
}

export const MessageItem = memo(({
  message,
  isOwn,
  showAvatar,
  currentUserId,
  onToggleReaction,
  onReply
}: MessageItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [reactionMenuPosition, setReactionMenuPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef<HTMLDivElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);

  // Enhanced reaction button click handler with proper positioning
  const handleReactionClick = useCallback(() => {
    if (!reactionButtonRef.current) return;

    const buttonRect = reactionButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Menu dimensions (more accurate for 6 emoji reactions)
    const menuWidth = 240; // 6 reactions * 36px + padding
    const menuHeight = 52; // Height of the reaction menu

    // Calculate initial position relative to button
    let x, y;

    if (isOwn) {
      // For own messages (right side), position menu to the left of the button
      x = buttonRect.left - menuWidth + 20; // Small offset to align better
    } else {
      // For other messages (left side), position menu to the right of the button
      x = buttonRect.right - 20; // Small offset to align better
    }

    // Center vertically on the button
    y = buttonRect.top + (buttonRect.height / 2);

    // Adjust for viewport boundaries with padding
    const padding = 16;

    // Horizontal boundary checks
    if (x < padding) {
      x = padding;
    } else if (x + menuWidth > viewportWidth - padding) {
      x = viewportWidth - menuWidth - padding;
    }

    // Vertical boundary checks
    const menuHalfHeight = menuHeight / 2;
    if (y - menuHalfHeight < padding) {
      y = padding + menuHalfHeight;
    } else if (y + menuHalfHeight > viewportHeight - padding) {
      y = viewportHeight - menuHalfHeight - padding;
    }

    setReactionMenuPosition({ x, y });
    setShowReactionMenu(true);
  }, [isOwn]);

  // Handle reaction selection
  const handleReactionSelect = (reactionType: ReactionType) => {
    onToggleReaction(message.id, reactionType);
    setShowReactionMenu(false);
  };

  // Handle reply button click
  const handleReplyClick = () => {
    onReply?.(message);
  };

  // Check if message has reactions - improved logic
  const hasReactions = message.reactions && (
    message.reactions.hasReactions ||
    message.reactions.totalReactions > 0 ||
    (message.reactions.reactionCounts && Object.keys(message.reactions.reactionCounts).length > 0)
  );


  return (
    <div
      ref={messageRef}
      className={`flex gap-3 mb-4 relative ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <UserAvatar
            name={message.senderName}
            avatar={message.senderAvatar}
            size="sm"
            variant="circle"
          />
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name */}
        {!isOwn && showAvatar && (
          <span className="text-xs mb-1 px-1" style={{ color: DARK_THEME.text.muted }}>
            {message.senderName}
          </span>
        )}

        {/* Reply Preview (if replying to a message) */}
        {message.replyToId && message.replyToContent && (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ReplyPreview
              content={message.replyToContent}
              senderName={message.replyToSenderName || 'Unknown'}
              isOwn={isOwn}
            />
          </React.Suspense>
        )}

        {/* Message Bubble Container with proper space for reactions */}
        <div className="relative mb-3">
          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl break-words whitespace-pre-wrap ${
              isOwn ? 'rounded-br-md' : 'rounded-bl-md'
            }`}
            style={{
              backgroundColor: isOwn ? THEME_COLORS.primary[500] : DARK_THEME.background.muted,
              color: isOwn ? '#ffffff' : DARK_THEME.text.primary,
              wordBreak: 'break-word',
            }}
          >
            {/* Text content - only show if there's actual content */}
            {message.content && message.content.trim() && (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}

            {/* File Attachment - Show directly in message bubble */}
            <FileAttachment message={message} />
          </div>

          {/* Message Actions (Hover) - Pass ref to reaction button */}
          <React.Suspense fallback={null}>
            <MessageActions
              isVisible={isHovered}
              onReactionClick={handleReactionClick}
              onReplyClick={handleReplyClick}
              isOwn={isOwn}
              reactionButtonRef={reactionButtonRef}
            />
          </React.Suspense>

          {/* Reaction Badges - Now positioned right at the edge of the message bubble */}
          {hasReactions && (
            <React.Suspense fallback={null}>
              <ReactionBadge
                reactions={message.reactions}
                currentUserId={currentUserId}
                onToggleReaction={(reactionType: ReactionType) => onToggleReaction(message.id, reactionType)}
                isOwn={isOwn}
                messageId={message.id}
              />
            </React.Suspense>
          )}
        </div>

        {/* Timestamp and Status - Now properly separated from the bubble+reactions */}
        <span className="text-xs px-1" style={{ color: DARK_THEME.text.muted }}>
          {formatTime(message.createdAt)}
          {/* Show read/delivered status for own messages */}
          {isOwn && (
            <span className="ml-2">
              {(message.readCount || 0) > 0 ? '✓✓' : (message.deliveredCount || 0) > 0 ? '✓' : '✓'}
            </span>
          )}
        </span>
      </div>

      {/* Reaction Menu Popup */}
      <React.Suspense fallback={null}>
        <ReactionMenu
          isVisible={showReactionMenu}
          position={reactionMenuPosition}
          onReactionSelect={handleReactionSelect}
          onClose={() => setShowReactionMenu(false)}
        />
      </React.Suspense>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
