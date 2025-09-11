"use client";

import React, { useState, useCallback } from "react";
import { CommentData } from "@/types/post";
import { PostsService } from "@/services/post";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { Button } from "@/components/ui/Button";
import { formatTimeAgo, formatLikeText, getUserDisplayName, getAvatarUrl } from "@/utils/commentUtils";
import { useAuth } from "@/components/auth/AuthProvider";

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

const ReplyForm: React.FC<ReplyFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Viết phản hồi...",
  isSubmitting
}) => {
  const [content, setContent] = useState("");
  const { user } = useAuth();

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
          name={user?.name || "Bạn"}
          avatar={user?.avatar}
          size="sm"
          className="flex-shrink-0 mt-1"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
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
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

const CommentActions: React.FC<CommentActionsProps> = ({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  isLiking
}) => (
  <div className="flex items-center space-x-4 mt-1 px-3 text-xs font-medium">
    <span className="text-gray-500 dark:text-gray-400">
      {formatTimeAgo(comment.createdAt)}
    </span>

    <Button
      variant="ghost"
      size="sm"
      className={`h-auto p-0 text-xs transition-colors ${
        comment.isLikedByCurrentUser 
          ? 'text-blue-600 dark:text-blue-400' 
          : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
      }`}
      onClick={onLike}
      disabled={isLiking}
    >
      {comment.isLikedByCurrentUser ? 'Đã thích' : 'Thích'}
      {comment.likeCount > 0 && ` (${comment.likeCount})`}
    </Button>

    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600"
      onClick={onReply}
    >
      Phản hồi
    </Button>

    {comment.canEdit && (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs text-gray-600 dark:text-gray-400 hover:text-yellow-600"
        onClick={onEdit}
      >
        Sửa
      </Button>
    )}

    {comment.canDelete && (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600"
        onClick={onDelete}
      >
        Xóa
      </Button>
    )}
  </div>
);

const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  onUpdate,
  onDelete,
  level = 0,
  maxLevel = 3
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

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
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      const response = await PostsService.deleteComment(comment.id);
      if (response.success && onDelete) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, [comment.id, onDelete]);

  const loadMoreReplies = useCallback(async () => {
    if (loadingReplies || comment.replyCount <= comment.replies.length) return;

    try {
      setLoadingReplies(true);
      const response = await PostsService.getCommentReplies(comment.id);
      if (response.success && onUpdate) {
        const updatedComment = {
          ...comment,
          replies: [...comment.replies, ...response.data]
        };
        onUpdate(comment.id, updatedComment);
      }
    } catch (error) {
      console.error('Error loading more replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  }, [comment, loadingReplies, onUpdate]);

  const { user } = useAuth();

  return (
    <div className={`comment-item ${isNested ? 'ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="flex space-x-3 mb-3 hover:bg-gray-50/5 dark:hover:bg-gray-800/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
        <div className="relative flex-shrink-0">
          <UserAvatar
            name={getUserDisplayName(comment.user.firstName, comment.user.lastName)}
            avatar={comment.user.avatarUrl}
            size="sm"
          />
          {comment.user.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 relative group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {getUserDisplayName(comment.user.firstName, comment.user.lastName)}
                </span>
                {comment.user.premiumBadgeUrl && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-transparent border-0 text-sm resize-none focus:outline-none text-gray-700 dark:text-gray-300"
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
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={!editContent.trim() || isSubmittingEdit}
                  >
                    {isSubmittingEdit ? "Đang lưu..." : "Lưu"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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
                    className="border-2 border-white dark:border-gray-900"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatLikeText(comment.recentLikes, comment.likeCount)}
              </span>
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && canNestDeeper && (
            <ReplyForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Phản hồi ${comment.user.firstName}...`}
              isSubmitting={isSubmittingReply}
            />
          )}

          {/* Replies */}
          {comment.replies.length > 0 && showReplies && (
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
          {comment.replyCount > comment.replies.length && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              onClick={loadMoreReplies}
              disabled={loadingReplies}
            >
              {loadingReplies
                ? "Đang tải..."
                : `Xem thêm ${comment.replyCount - comment.replies.length} phản hồi`
              }
            </Button>
          )}

          {/* Toggle Replies */}
          {comment.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xs"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? 'Ẩn phản hồi' : `Hiện ${comment.replies.length} phản hồi`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
