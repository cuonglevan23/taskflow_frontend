"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { PostData } from "@/types/post";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { Button } from "@/components/ui/button";
import BaseModal from "@/components/ui/modal/BaseModal";
import Comment from "./Comment";
import PostActions from "./PostActions";
import PostHeader from "./PostHeader";
import EditPostModal from "./EditPostModal";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePostModal } from "@/hooks/posts/usePostModal";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

interface PostModalProps {
  post: PostData;
  isOpen: boolean;
  onClose: () => void;
  initialImageIndex?: number;
}

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  placeholder?: string;
}

// Image Gallery Component for Multiple Images
interface ImageGalleryProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const ImageGallery = ({ images, currentIndex, onIndexChange }: ImageGalleryProps) => {
  const { themeMode } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get nested message value
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const isDark = themeMode === 'dark';
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  }, [currentIndex, images.length]);

  useEffect(() => {
    if (hasMultipleImages) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, hasMultipleImages]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main Image */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`${t('postModal.imageGallery.imageAlt')} ${currentIndex + 1} / ${images.length}`}
          className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto'
          }}
        />
      </div>

      {/* Navigation for Multiple Images */}
      {hasMultipleImages && (
        <>
          {/* Previous Button */}
          {currentIndex > 0 && (
            <button
              onClick={prevImage}
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full hover:opacity-90 transition-all flex items-center justify-center backdrop-blur-sm border ${
                isDark 
                  ? 'bg-gray-800 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              style={{ zIndex: 10 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {currentIndex < images.length - 1 && (
            <button
              onClick={nextImage}
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full hover:opacity-90 transition-all flex items-center justify-center backdrop-blur-sm border ${
                isDark 
                  ? 'bg-gray-800 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              style={{ zIndex: 10 }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image Counter */}
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm backdrop-blur-sm border ${
              isDark 
                ? 'bg-gray-800 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            }`}
          >
            {currentIndex + 1} / {images.length}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && images.length <= 10 && (
            <div
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-lg backdrop-blur-sm border ${
                isDark 
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-white border-gray-300'
              }`}
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onIndexChange(index)}
                  className={`w-12 h-12 rounded-md overflow-hidden transition-all border-2 ${
                    index === currentIndex 
                      ? 'scale-110' 
                      : 'opacity-70 hover:opacity-100'
                  } ${
                    index === currentIndex
                      ? (isDark ? 'border-white' : 'border-gray-900')
                      : (isDark ? 'border-gray-600' : 'border-gray-300')
                  }`}
                >
                  <img
                    src={image}
                    alt={`${t('postModal.imageGallery.thumbnailAlt')} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CommentForm = ({
  onSubmit,
  isSubmitting,
  placeholder
}: CommentFormProps) => {
  const [content, setContent] = useState("");
  const { themeMode } = useThemeContext();
  const { messages } = useLanguageContext();
  const { user } = useAuth();

  // Helper function to get nested message value
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const isDark = themeMode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content.trim());
    setContent("");
  };

  return (
    <div
      className={`sticky bottom-0 p-4 border-t ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-3">
          <UserAvatar
            name={user?.name || t('postModal.commentForm.defaultUserName')}
            avatar={user?.avatar}
            size="sm"
            className="flex-shrink-0 mt-1"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder || t('postModal.commentForm.placeholder')}
              className={`w-full border-0 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-gray-900 text-white focus:ring-blue-500' 
                  : 'bg-gray-100 text-gray-900 focus:ring-blue-500'
              }`}
              rows={2}
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                size="sm"
                className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('postModal.commentForm.submitting')}</span>
                  </div>
                ) : (
                  t('postModal.commentForm.submit')
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default function PostModal({ post, isOpen, onClose, initialImageIndex = 0 }: PostModalProps) {
  const modalHook = usePostModal({ post, isOpen, initialImageIndex });
  const { themeMode } = useThemeContext();
  const { messages } = useLanguageContext();

  // Helper function to get nested message value
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const isDark = themeMode === 'dark';

  const {
    comments,
    isLoadingComments,
    isSubmittingComment,
    currentPost,
    commentsCount,
    hasMoreComments,
    currentImageIndex,
    showEditModal,
    images,
    hasImages,
    setCurrentImageIndex,
    setShowEditModal,
    handlePostUpdate,
    handleLike,
    loadComments,
    handleSubmitComment,
    handleReply,
    handleCommentUpdate,
    handleCommentDelete,
    formatTimestamp
  } = modalHook;

  // Handle post deletion
  const handlePostDelete = () => {
    onClose(); // Close modal when post is deleted
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="7xl"
        height="screen"
        showHeader={false}
        backdropClickToClose={true}
        className="p-0"
        contentClassName="flex h-full max-h-screen"
      >
        {/* Left Side - Post Content */}
        <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
          {hasImages ? (
            <div className="flex-1 flex items-center justify-center p-4 min-h-0">
              <ImageGallery
                images={images}
                currentIndex={currentImageIndex}
                onIndexChange={setCurrentImageIndex}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-2xl text-center">
                <div
                  className="backdrop-blur-sm rounded-2xl p-8"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                >
                  <p className="text-2xl leading-relaxed font-light">
                    {post.content}
                  </p>

                  {/* Linked Content */}
                  {(post.linkedTask || post.linkedProject) && (
                    <div
                      className="mt-6 p-4 rounded-xl"
                      style={{
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        border: '1px solid rgba(37, 99, 235, 0.2)'
                      }}
                    >
                      {post.linkedTask && (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white">🎯</span>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm">{t('postModal.linkedContent.linkedTask')}</p>
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
                            <p className="text-purple-200 text-sm">{t('postModal.linkedContent.linkedProject')}</p>
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
        <div
          className={`w-[400px] flex flex-col max-h-screen border-l ${
            isDark 
              ? 'bg-gray-900/70 border-gray-700' 
              : 'bg-white/70 border-gray-200'
          }`}
        >
          {/* Post Header - Fixed */}
          <div className="flex-shrink-0 p-4">
            <PostHeader
              post={currentPost}
              authorName={currentPost.authorName}
              authorAvatar={currentPost.authorAvatar}
              isPremium={!!currentPost.authorPremiumBadge}
              timestamp={formatTimestamp(currentPost.createdAt)}
              onEdit={() => setShowEditModal(true)}
            />
          </div>

          {/* Post Content - Fixed */}
          <div
            className={`flex-shrink-0 px-4 py-3 border-b ${
              isDark 
                ? 'bg-gray-900/70 border-gray-700' 
                : 'bg-white/70 border-gray-200'
            }`}
          >
            <div className="space-y-3">
              {/* Post Text Content */}
              <div
                className={`whitespace-pre-wrap leading-relaxed ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {currentPost.content}
              </div>

              {/* Linked Task/Project */}
              {(currentPost.linkedTask || currentPost.linkedProject) && (
                <div
                  className={`p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-800/50 border-gray-600' 
                      : 'bg-gray-50/50 border-gray-200'
                  }`}
                >
                  {currentPost.linkedTask && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">🎯</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                          {t('postModal.linkedContent.linkedTask')}
                        </p>
                        <Link
                          href={`/tasks/${currentPost.linkedTask.id}`}
                          className={`font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm truncate block ${
                            isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {currentPost.linkedTask.title}
                        </Link>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                            currentPost.linkedTask.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }`}
                        >
                          {currentPost.linkedTask.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {currentPost.linkedProject && (
                    <div className={`flex items-center space-x-3 ${currentPost.linkedTask ? 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-600' : ''}`}>
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">📁</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-purple-600 dark:text-purple-400 text-xs font-medium">
                          {t('postModal.linkedContent.linkedProject')}
                        </p>
                        <Link
                          href={`/projects/${currentPost.linkedProject.id}`}
                          className={`font-semibold hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm truncate block ${
                            isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {currentPost.linkedProject.title}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pinned Indicator */}
              {currentPost.isPinned && (
                <div
                  className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200"
                >
                  <span className="text-yellow-600">📌</span>
                  <span className="text-xs font-medium text-yellow-800">
                    {t('postModal.pinnedPost')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Post Actions - Fixed */}
          <div
            className={`flex-shrink-0 px-4 py-3 border-b ${
              isDark 
                ? 'bg-gray-900/70 border-gray-700' 
                : 'bg-white/70 border-gray-200'
            }`}
          >
            <PostActions
              post={currentPost}
              onLike={handleLike}
              onComment={() => {}}
              onShare={() => {}}
            />
          </div>

          {/* Comments Header - Fixed */}
          <div
            className={`flex-shrink-0 px-4 py-3 border-b ${
              isDark 
                ? 'bg-gray-900/70 border-gray-700' 
                : 'bg-white/70 border-gray-200'
            }`}
          >
            <h4
              className={`font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('postModal.comments.title')} ({commentsCount})
            </h4>
          </div>

          {/* Comments Section - Scrollable */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Comments List */}
            <div
              className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent"
              style={{
                maxHeight: 'calc(100vh - 280px)',
                minHeight: '200px',
                scrollbarColor: isDark ? 'rgba(255, 255, 255, 0.2) transparent' : 'rgba(0, 0, 0, 0.2) transparent'
              }}
            >
              <div className="px-4 py-3">
                {isLoadingComments && comments.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-3">
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
                          className="font-medium text-blue-600 bg-transparent hover:bg-blue-50"
                        >
                          {isLoadingComments ? t('postModal.comments.loading') : t('postModal.comments.loadMore')}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <MessageCircle
                        className={`w-8 h-8 ${
                          isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <p
                      className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {t('postModal.comments.noComments')}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {t('postModal.comments.beFirst')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Comment Form - Sticky bottom */}
            <CommentForm
              onSubmit={handleSubmitComment}
              isSubmitting={isSubmittingComment}
            />
          </div>
        </div>
      </BaseModal>

      {/* Edit Post Modal */}
      <EditPostModal
        post={currentPost}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handlePostUpdate}
      />
    </>
  );
}
