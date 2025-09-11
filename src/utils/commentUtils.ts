/**
 * Comment utility functions for formatting and display
 */

import { RecentLike } from '@/types/post';

/**
 * Format like text in Facebook style
 */
export const formatLikeText = (recentLikes: RecentLike[], totalCount: number): string => {
  if (totalCount === 0) return '';

  if (totalCount === 1) {
    return `${recentLikes[0]?.firstName} thích điều này`;
  }

  if (totalCount === 2 && recentLikes.length >= 2) {
    return `${recentLikes[0].firstName} và ${recentLikes[1].firstName} thích điều này`;
  }

  if (totalCount === 3 && recentLikes.length >= 3) {
    return `${recentLikes[0].firstName}, ${recentLikes[1].firstName} và ${recentLikes[2].firstName} thích điều này`;
  }

  if (recentLikes.length > 0) {
    const others = totalCount - recentLikes.length;
    const names = recentLikes.slice(0, 2).map(like => like.firstName).join(', ');
    return others > 0
      ? `${names} và ${others} người khác thích điều này`
      : `${names} thích điều này`;
  }

  return `${totalCount} lượt thích`;
};

/**
 * Format timestamp relative to now (Facebook style)
 */
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút`;
  if (hours < 24) return `${hours} giờ`;
  if (days < 7) return `${days} ngày`;
  if (weeks < 4) return `${weeks} tuần`;
  if (months < 12) return `${months} tháng`;
  return `${years} năm`;
};

/**
 * Format absolute timestamp for tooltips
 */
export const formatAbsoluteTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Check if user can perform action on comment
 */
export const canPerformCommentAction = (
  comment: { canEdit: boolean; canDelete: boolean },
  action: 'edit' | 'delete'
): boolean => {
  return action === 'edit' ? comment.canEdit : comment.canDelete;
};

/**
 * Generate user display name
 */
export const getUserDisplayName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

/**
 * Get avatar URL with fallback
 */
export const getAvatarUrl = (avatarUrl: string | null, fallback = '/images/default-avatar.png'): string => {
  return avatarUrl || fallback;
};
