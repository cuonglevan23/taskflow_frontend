"use client";

import React, { useState, useCallback } from "react";
import { CommentData } from "@/types/post";
import { PostsService } from "@/services/post";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, formatLikeText, getUserDisplayName } from "@/utils/commentUtils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";


interface CommentProps {
  comment: CommentData;
  onReply?: (parentId: number, content: string) => Promise<void>;
  onUpdate?: (commentId: number, newComment: CommentData) => void;
  onDelete?: (commentId: number) => void;
  level?: number;
  maxLevel?: number;
}

interface CommentActionsProps {
  comment: CommentData;
  onLike: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isLiking: boolean;
}

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  isSubmitting: boolean;
}

const ReplyForm = ({
  onSubmit,
  onCancel,
  placeholder,
  isSubmitting
}: ReplyFormProps) => {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content.trim());
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 ml-12">
      <div className="flex space-x-2">
        <UserAvatar
          name={user?.name || t('you')}
          avatar={user?.avatar}
          size="sm"
          className="flex-shrink-0 mt-1"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder || t('comments.write_reply')}
            className="w-full border-0 rounded-2xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: theme.background.secondary,
              color: theme.text.primary,
              borderColor: theme.border.default,
              '--tw-ring-color': '#3b82f6',
            } as React.CSSProperties & { '--tw-ring-color': string }}
            rows={2}
            disabled={isSubmitting}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{ color: theme.text.muted }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? t('sending') : t('send')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

const CommentActions = ({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  isLiking
}: CommentActionsProps) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <div className="flex items-center space-x-4 mt-1 px-3 text-xs font-medium">
      <span style={{ color: theme.text.muted }}>
        {formatTimeAgo(comment.createdAt)}
      </span>

      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs transition-colors"
        style={{
          color: comment.isLikedByCurrentUser ? '#3b82f6' : theme.text.muted
        }}
        onClick={onLike}
        disabled={isLiking}
        onMouseEnter={(e) => {
          if (!comment.isLikedByCurrentUser) {
            e.currentTarget.style.color = '#3b82f6';
          }
        }}
        onMouseLeave={(e) => {
          if (!comment.isLikedByCurrentUser) {
            e.currentTarget.style.color = theme.text.muted;
          }
        }}
      >
        {comment.isLikedByCurrentUser ? t('comments.liked') : t('comments.like')}
        {comment.likeCount > 0 && ` (${comment.likeCount})`}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs transition-colors"
        style={{ color: theme.text.muted }}
        onClick={onReply}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#3b82f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.text.muted;
        }}
      >
        {t('comments.reply')}
      </Button>

      {comment.canEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs transition-colors"
          style={{ color: theme.text.muted }}
          onClick={onEdit}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#eab308';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.text.muted;
          }}
        >
          {t('comments.edit')}
        </Button>
      )}

      {comment.canDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs transition-colors"
          style={{ color: theme.text.muted }}
          onClick={onDelete}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.text.muted;
          }}
        >
          {t('comments.delete')}
        </Button>
      )}
    </div>
  );
};

const Comment = ({
  comment,
  onReply,
  onUpdate,
  onDelete,
  level = 0,
  maxLevel = 3
}: CommentProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const { user } = useAuth();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  };

  const isNested = level > 0;
  const canNestDeeper = level < maxLevel;

  const handleLike = useCallback(async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await PostsService.toggleCommentLike(comment.id);
      if (response.success && onUpdate) {
        onUpdate(comment.id, response.data);
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
    } finally {
      setIsLiking(false);
    }
  }, [comment.id, isLiking, onUpdate]);

  const handleReply = useCallback(async (content: string) => {
    if (!onReply) return;

    try {
      setIsSubmittingReply(true);
      await onReply(comment.id, content);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  }, [comment.id, onReply]);

  const handleEdit = useCallback(async () => {
    if (!editContent.trim() || isSubmittingEdit) return;

    try {
      setIsSubmittingEdit(true);
      const response = await PostsService.editComment(comment.id, editContent.trim());
      if (response.success && onUpdate) {
        onUpdate(comment.id, response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setIsSubmittingEdit(false);
    }
  }, [comment.id, editContent, isSubmittingEdit, onUpdate]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(t('comments.delete_confirmation'))) return;

    try {
      const response = await PostsService.deleteComment(comment.id);
      if (response.success && onDelete) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, [comment.id, onDelete, t]);

  const loadMoreReplies = useCallback(async () => {
    if (loadingReplies || comment.replyCount <= (comment.replies?.length || 0)) return;

    try {
      setLoadingReplies(true);
      const response = await PostsService.getCommentReplies(comment.id);
      if (response.success && onUpdate) {
        const updatedComment = {
          ...comment,
          replies: [...(comment.replies || []), ...response.data]
        };
        onUpdate(comment.id, updatedComment);
      }
    } catch (error) {
      console.error('Error loading more replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  }, [comment, loadingReplies, onUpdate]);

  return (
    <div
      className={`comment-item ${isNested ? 'ml-6 pl-4 border-l-2' : ''}`}
      style={{
        borderColor: isNested ? theme.border.default : 'transparent'
      }}
    >
      <div
        className="flex space-x-3 mb-3 -mx-2 px-2 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.background.weakHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div className="relative flex-shrink-0">
          <UserAvatar
            name={comment.user?.firstName && comment.user?.lastName
              ? getUserDisplayName(comment.user.firstName, comment.user.lastName)
              : comment.user?.username || t('unknown_user')
            }
            avatar={comment.user?.avatarUrl}
            size="sm"
          />
          {comment.user?.isOnline && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full"
              style={{ borderColor: theme.background.primary }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="rounded-2xl px-4 py-3 relative group"
            style={{ backgroundColor: theme.background.secondary }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span
                  className="font-semibold text-sm"
                  style={{ color: theme.text.primary }}
                >
                  {comment.user?.firstName && comment.user?.lastName
                    ? getUserDisplayName(comment.user.firstName, comment.user.lastName)
                    : comment.user?.username || t('unknown_user')
                  }
                </span>
                {comment.user?.premiumBadgeUrl && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                    {t('premium')}
                  </span>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-transparent border-0 text-sm resize-none focus:outline-none"
                  style={{ color: theme.text.secondary }}
                  rows={2}
                  disabled={isSubmittingEdit}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    disabled={isSubmittingEdit}
                    style={{ color: theme.text.muted }}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={!editContent.trim() || isSubmittingEdit}
                  >
                    {isSubmittingEdit ? t('saving') : t('save')}
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.text.secondary }}
              >
                {comment.content}
              </p>
            )}
          </div>

          <CommentActions
            comment={comment}
            onLike={handleLike}
            onReply={() => setShowReplyForm(!showReplyForm)}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            isLiking={isLiking}
          />

          {/* Recent Likes */}
          {comment.recentLikes.length > 0 && (
            <div className="flex items-center space-x-2 mt-2 px-3">
              <div className="flex -space-x-1">
                {comment.recentLikes.slice(0, 3).map((like) => (
                  <UserAvatar
                    key={like.userId}
                    name={getUserDisplayName(like.firstName, like.lastName)}
                    avatar={like.avatarUrl}
                    size="xs"
                    className="border-2"
                    style={{ borderColor: theme.background.primary }}
                  />
                ))}
              </div>
              <span
                className="text-xs"
                style={{ color: theme.text.muted }}
              >
                {formatLikeText(comment.recentLikes, comment.likeCount)}
              </span>
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && canNestDeeper && (
            <ReplyForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder={t('comments.reply_to').replace('{{name}}', comment.user?.firstName || comment.user?.username || t('user'))}
              isSubmitting={isSubmittingReply}
            />
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && showReplies && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  level={level + 1}
                  maxLevel={maxLevel}
                />
              ))}
            </div>
          )}

          {/* Load More Replies */}
          {comment.replyCount > (comment.replies?.length || 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 font-medium transition-colors"
              style={{ color: '#3b82f6' }}
              onClick={loadMoreReplies}
              disabled={loadingReplies}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3b82f6';
              }}
            >
              {loadingReplies
                ? t('loading')
                : t('comments.view_more_replies').replace('{{count}}', String(comment.replyCount - (comment.replies?.length || 0)))
              }
            </Button>
          )}

          {/* Toggle Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 text-xs transition-colors"
              style={{ color: theme.text.muted }}
              onClick={() => setShowReplies(!showReplies)}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.text.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.text.muted;
              }}
            >
              {showReplies ? t('comments.hide_replies') : t('comments.show_replies').replace('{{count}}', String(comment.replies.length))}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
