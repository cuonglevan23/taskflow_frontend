"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, ThumbsUp } from "lucide-react";
import { PostData, CommentData } from "@/types/post";
import { PostsService } from "@/services/post";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { Button } from "@/components/ui/Button";
import BaseModal from "@/components/ui/modal/BaseModal";
import Comment from "./Comment";
import Link from "next/link";
import { formatTimeAgo } from "@/utils/commentUtils";
import { useAuth } from "@/components/auth/AuthProvider";
interface PostModalProps {
  post: PostData;
  isOpen: boolean;
  onClose: () => void;
}

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isSubmitting,
  placeholder = "Viết bình luận..."
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content.trim());
    setContent("");
  };
  const { user } = useAuth();
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex space-x-3">
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
            className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
            rows={2}
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              size="sm"
              className="px-6"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang gửi...</span>
                </div>
              ) : (
                'Gửi'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default function PostModal({ post, isOpen, onClose }: PostModalProps) {
  // State management
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Privacy configuration memoization
  const privacyConfig = useMemo(() => {
    switch (post.privacy) {
      case 'PUBLIC':
        return { icon: '🌍', label: 'Công khai', color: 'text-green-600' };
      case 'FRIENDS':
        return { icon: '👥', label: 'Bạn bè', color: 'text-blue-600' };
      case 'PRIVATE':
        return { icon: '🔒', label: 'Riêng tư', color: 'text-orange-600' };
      default:
        return { icon: '🌍', label: 'Công khai', color: 'text-green-600' };
    }
  }, [post.privacy]);

  // Load comments when modal opens
  useEffect(() => {
    if (isOpen && post.id) {
      loadComments(true);
    }
  }, [isOpen, post.id]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setComments([]);
      setCurrentPage(0);
      setHasMoreComments(false);
    }
  }, [isOpen]);

  /**
   * Load comments with pagination support
   */
  const loadComments = useCallback(async (reset = false) => {
    try {
      setIsLoadingComments(true);
      const page = reset ? 0 : currentPage;
      const response = await PostsService.getComments(post.id, page, 20);

      if (response.success) {
        const newComments = response.data || [];
        setComments(prev => reset ? newComments : [...prev, ...newComments]);
        setHasMoreComments(response.pagination?.hasNext || false);
        if (!reset) {
          setCurrentPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, currentPage]);

  /**
   * Handle new comment submission
   */
  const handleSubmitComment = useCallback(async (content: string) => {
    try {
      setIsSubmittingComment(true);
      const response = await PostsService.addComment(post.id, content);

      if (response.success) {
        setComments(prev => [response.data, ...prev]);
        setCommentsCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [post.id]);

  /**
   * Handle reply to comment
   */
  const handleReply = useCallback(async (parentId: number, content: string) => {
    try {
      const response = await PostsService.addComment(post.id, content, parentId);

      if (response.success) {
        // Update the parent comment's replies
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [response.data, ...comment.replies],
              replyCount: comment.replyCount + 1
            };
          }
          return comment;
        }));
        setCommentsCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error; // Re-throw to handle in Comment component
    }
  }, [post.id]);

  /**
   * Handle comment update (for likes, edits)
   */
  const handleCommentUpdate = useCallback((commentId: number, updatedComment: CommentData) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return updatedComment;
      }
      // Check in replies
      if (comment.replies.some(reply => reply.id === commentId)) {
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === commentId ? updatedComment : reply
          )
        };
      }
      return comment;
    }));
  }, []);

  /**
   * Handle comment deletion
   */
  const handleCommentDelete = useCallback((commentId: number) => {
    setComments(prev => {
      // Remove top-level comment
      const filtered = prev.filter(comment => comment.id !== commentId);

      // Remove from replies and update counts
      const updated = filtered.map(comment => ({
        ...comment,
        replies: comment.replies.filter(reply => reply.id !== commentId),
        replyCount: comment.replies.filter(reply => reply.id !== commentId).length
      }));

      return updated;
    });
    setCommentsCount(prev => prev - 1);
  }, []);

  /**
   * Handle post like
   */
  const handleLike = useCallback(async () => {
    const previousState = { isLiked, likesCount };

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await PostsService.toggleLike(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setIsLiked(previousState.isLiked);
      setLikesCount(previousState.likesCount);
    }
  }, [post.id, isLiked, likesCount]);

  /**
   * Format post timestamp
   */
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="7xl"
      height="screen"
      showHeader={false}
      backdropClickToClose={true}
      className="p-0"
      contentClassName="flex h-full"
    >
      {/* Left Side - Post Content */}
      <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
        {post.imageUrl ? (
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto'
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl text-center text-white">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                <p className="text-2xl leading-relaxed font-light">
                  {post.content}
                </p>

                {/* Linked Content */}
                {(post.linkedTask || post.linkedProject) && (
                  <div className="mt-6 p-4 bg-blue-900/30 rounded-xl border border-blue-700/50">
                    {post.linkedTask && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white">🎯</span>
                        </div>
                        <div>
                          <p className="text-blue-200 text-sm">Liên kết với nhiệm vụ</p>
                          <Link
                            href={`/tasks/${post.linkedTask.id}`}
                            className="text-white font-semibold hover:text-blue-300 transition-colors"
                          >
                            {post.linkedTask.title}
                          </Link>
                        </div>
                      </div>
                    )}

                    {post.linkedProject && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white">📁</span>
                        </div>
                        <div>
                          <p className="text-purple-200 text-sm">Liên kết với dự án</p>
                          <Link
                            href={`/projects/${post.linkedProject.id}`}
                            className="text-white font-semibold hover:text-purple-300 transition-colors"
                          >
                            {post.linkedProject.title}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Comments Panel */}
      <div className="w-[400px] flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
        {/* Post Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <UserAvatar
              name={post.authorName}
              avatar={post.authorAvatar}
              size="md"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {post.authorName}
                </h3>
                {post.authorPremiumBadge && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                    {post.authorPremiumBadge}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTimestamp(post.createdAt)}
                </time>
                <span className="text-gray-300">•</span>
                <div className={`flex items-center space-x-1 text-xs ${privacyConfig.color}`}>
                  <span>{privacyConfig.icon}</span>
                  <span>{privacyConfig.label}</span>
                </div>
              </div>

              {/* Pinned Indicator */}
              {post.isPinned && (
                <div className="mt-2">
                  <span className="inline-flex items-center space-x-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                    <span>📌</span>
                    <span>Đã ghim</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Stats & Actions */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-4">
              {likesCount > 0 && (
                <span className="flex items-center space-x-1">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <ThumbsUp className="w-3 h-3 text-white" />
                    </div>
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>
                  <span>{likesCount}</span>
                </span>
              )}
              {commentsCount > 0 && (
                <span>{commentsCount} bình luận</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
              }`}
            >
              <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
              <span className="font-medium text-sm">
                {isLiked ? 'Đã thích' : 'Thích'}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Bình luận</span>
            </Button>


          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Comments Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Bình luận ({commentsCount})
            </h4>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {isLoadingComments && comments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onUpdate={handleCommentUpdate}
                    onDelete={handleCommentDelete}
                  />
                ))}

                {/* Load More Comments */}
                {hasMoreComments && (
                  <div className="py-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadComments(false)}
                      disabled={isLoadingComments}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      {isLoadingComments ? "Đang tải..." : "Xem thêm bình luận"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Chưa có bình luận nào
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Hãy là người đầu tiên bình luận!
                </p>
              </div>
            )}
          </div>

          {/* Comment Form */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <CommentForm
              onSubmit={handleSubmitComment}
              isSubmitting={isSubmittingComment}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
