"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import PostModal from "./PostModal";
import EditPostModal from "./EditPostModal";
import { PostData } from "@/types/post";
import { usePostCard, useSyncedPost } from "@/hooks";
import { usePostManagement } from "@/hooks/posts";
import { useGalleryLayout, ImageItem } from "@/hooks/posts/useGalleryLayout";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Edit3, Trash2 } from "lucide-react";

interface PostCardProps {
  post: PostData;
  showShareCount?: boolean;
}

// Optimized Image Grid Component with Facebook-style layout
interface ImageGridProps {
  images: string[];
  onImageClick: (index: number) => void;
}

const ImageGrid = ({ images, onImageClick }: ImageGridProps) => {
  const { theme } = useThemeContext();

  // Convert string URLs to ImageItem objects
  const imageItems: ImageItem[] = useMemo(() =>
    images.map((url, index) => ({
      id: index,
      url,
      alt: `Post image ${index + 1}`,
    }))
  , [images]);

  const layout = useGalleryLayout(imageItems);

  if (layout.totalImages === 0) {
    return null;
  }

  // Single image layout - Facebook style
  if (layout.totalImages === 1) {
    const image = layout.rows[0][0];
    return (
      <div className="mt-3 overflow-hidden rounded-lg">
        <figure
          className="relative w-full cursor-pointer group"
          onClick={() => onImageClick(0)}
        >
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-auto max-h-[500px] object-cover group-hover:brightness-95 transition-all duration-200"
            style={{ backgroundColor: theme.background.muted }}
            loading="lazy"
          />
        </figure>
      </div>
    );
  }

  // Two images layout - Facebook style side by side
  if (layout.totalImages === 2) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg">
        <div className="grid grid-cols-2 gap-[2px] min-w-0">
          {images.slice(0, 2).map((url, index) => (
            <figure
              key={index}
              className="relative aspect-square cursor-pointer group overflow-hidden"
              onClick={() => onImageClick(index)}
            >
              <img
                src={url}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-200"
                style={{ backgroundColor: theme.background.muted }}
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </div>
    );
  }

  // Three images layout - Facebook style: 1 large left + 2 stacked right
  if (layout.totalImages === 3) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg">
        <div className="grid grid-cols-2 gap-[2px] h-[300px] min-w-0">
          {/* Large image on the left */}
          <figure
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => onImageClick(0)}
          >
            <img
              src={images[0]}
              alt="Post image 1"
              className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-200"
              style={{ backgroundColor: theme.background.muted }}
              loading="lazy"
            />
          </figure>

          {/* Two smaller images stacked on the right */}
          <div className="grid grid-rows-2 gap-[2px] min-w-0">
            {images.slice(1, 3).map((url, index) => (
              <figure
                key={index + 1}
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => onImageClick(index + 1)}
              >
                <img
                  src={url}
                  alt={`Post image ${index + 2}`}
                  className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-200"
                  style={{ backgroundColor: theme.background.muted }}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Four or more images layout - Facebook style: 2x2 grid with overlay
  const visibleImages = images.slice(0, 4);
  const remainingCount = Math.max(0, images.length - 4);

  return (
    <div className="mt-3 overflow-hidden rounded-lg">
      <div className="grid grid-cols-2 grid-rows-2 gap-[2px] aspect-square min-w-0">
        {visibleImages.map((url, index) => {
          const isLastImage = index === 3;
          const showOverlay = isLastImage && remainingCount > 0;

          return (
            <figure
              key={index}
              className="relative cursor-pointer group overflow-hidden"
              onClick={() => onImageClick(index)}
            >
              <img
                src={url}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-200"
                style={{ backgroundColor: theme.background.muted }}
                loading="lazy"
              />

              {/* Overlay for additional images */}
              {showOverlay && (
                <div
                  className="absolute inset-0 flex items-center justify-center group-hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `${theme.background.primary}aa` }}
                >
                  <span
                    className="text-2xl font-semibold"
                    style={{ color: theme.text.inverse }}
                  >
                    +{remainingCount}
                  </span>
                </div>
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
};

export default function PostCard({
  post: initialPost,
  showShareCount = false
}: PostCardProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  // Use synced post data that updates with SWR cache changes
  const post = useSyncedPost(initialPost);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    formatTimestamp,
    handleLike,
    handleShare,
    handleAuthorClick,
  } = usePostCard(post);

  const {
    canEditPost,
    canDeletePost,
    deletePost,
    isDeleting
  } = usePostManagement();

  // Check if user has any menu actions available
  const hasMenuActions = canEditPost(post) || canDeletePost(post);

  // Get images array (support both single and multiple images)
  const images = useMemo(() => {
    if (post.imageUrls && post.imageUrls.length > 0) {
      return post.imageUrls;
    } else if (post.imageUrl) {
      return [post.imageUrl];
    }
    return [];
  }, [post.imageUrls, post.imageUrl]);

  const hasImages = images.length > 0;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Handle menu click - only if user has permissions
  const handleMenuClick = () => {
    if (hasMenuActions) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  // Handle edit click - with permission check
  const handleEditClick = () => {
    if (!canEditPost(post)) {
      console.warn('Unauthorized edit attempt');
      return;
    }
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  // Handle delete click - with permission check
  const handleDeleteClick = async () => {
    if (!canDeletePost(post)) {
      console.warn('Unauthorized delete attempt');
      return;
    }

    const confirmMessage = messages.editPost?.unsavedWarning?.message || 'Bạn có chắc chắn muốn xóa bài viết này?';
    if (window.confirm(confirmMessage)) {
      try {
        await deletePost(
          post.id,
          () => {
            console.log('Post deleted successfully');
          },
          (error) => {
            console.error('Failed to delete post:', error);
            const errorMessage = messages.createPost?.errors?.createFailed || 'Không thể xóa bài viết. Vui lòng thử lại.';
            alert(errorMessage);
          }
        );
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
    setIsMenuOpen(false);
  };

  // Handle comment button click to open modal
  const handleComment = () => {
    setIsModalOpen(true);
  };

  // Handle image click - open modal with specific image
  const handleImageClick = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  // Handle edit success - with permission check
  const handleEditSuccess = (updatedPost: PostData) => {
    if (!canEditPost(post)) {
      console.warn('Unauthorized edit success callback');
      return;
    }
    setIsEditModalOpen(false);
    // The post will be automatically updated via SWR cache
  };

  return (
    <>
      <div className="relative">
        <BaseCard
          variant="compact"
          title=""
          onMenuClick={hasMenuActions ? handleMenuClick : undefined}
        >
          {/* Post Header */}
          <PostHeader
            post={post}
            authorName={post.authorName}
            authorAvatar={post.authorAvatar}
            isPremium={!!post.authorPremiumBadge}
            timestamp={formatTimestamp}
            onAuthorClick={handleAuthorClick}
            onEdit={canEditPost(post) ? handleEditClick : undefined}
          />

          {/* Pinned Indicator */}
          {post.isPinned && (
            <div className="mb-2" role="banner" aria-label="Pinned post">
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  color: theme.status.warning,
                  backgroundColor: `${theme.status.warning}20`
                }}
              >
                📌 {messages.postModal?.pinnedPost || 'Pinned Post'}
              </span>
            </div>
          )}

          {/* Linked Task/Project */}
          {(post.linkedTask || post.linkedProject) && (
            <aside
              className="mb-3 p-2 rounded border-l-4"
              style={{
                backgroundColor: `${theme.background.secondary}80`,
                borderLeftColor: theme.status.info
              }}
              aria-label="Related content"
            >
              {post.linkedTask && (
                <div className="text-sm" style={{ color: theme.text.secondary }}>
                  <span role="img" aria-label="Task">🎯</span>
                  <span className="font-medium ml-1">Task:</span>
                  <Link
                    href={`/tasks/${post.linkedTask.id}`}
                    className="hover:opacity-80 transition-colors ml-1"
                    style={{ color: theme.status.info }}
                    aria-label={`View task: ${post.linkedTask.title}`}
                  >
                    {post.linkedTask.title}
                  </Link>
                  <span
                    className="ml-2 px-2 py-0.5 rounded text-xs text-white"
                    style={{
                      backgroundColor: post.linkedTask.status === 'COMPLETED' ? theme.status.success : theme.status.info
                    }}
                    aria-label={`Task status: ${post.linkedTask.status}`}
                  >
                    {post.linkedTask.status}
                  </span>
                </div>
              )}
              {post.linkedProject && (
                <div className="text-sm" style={{ color: theme.text.secondary }}>
                  <span role="img" aria-label="Project">📁</span>
                  <span className="font-medium ml-1">Project:</span>
                  <Link
                    href={`/projects/${post.linkedProject.id}`}
                    className="hover:opacity-80 transition-colors ml-1"
                    style={{ color: theme.status.info }}
                    aria-label={`View project: ${post.linkedProject.title}`}
                  >
                    {post.linkedProject.title}
                  </Link>
                </div>
              )}
            </aside>
          )}

          {/* Post Content */}
          <article className="mb-4 min-w-0 overflow-hidden">
            <p
              className="whitespace-pre-wrap break-words"
              style={{ color: theme.text.primary }}
              role="main"
            >
              {post.content}
            </p>

            {/* Multiple Images Grid */}
            {hasImages && (
              <ImageGrid
                images={images}
                onImageClick={handleImageClick}
              />
            )}
          </article>

          {/* Post Actions */}
          <PostActions
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            showShareCount={showShareCount}
          />
        </BaseCard>

        {/* Dropdown Menu - Only show if user has permissions */}
        {isMenuOpen && hasMenuActions && (
          <div
            ref={menuRef}
            className="absolute top-12 right-4 border rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default
            }}
          >
            {canEditPost(post) && (
              <button
                onClick={handleEditClick}
                className="w-full px-4 py-2 text-left flex items-center gap-2 transition-colors"
                style={{ color: theme.text.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.weakHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Edit3 className="w-4 h-4" />
                {messages.editPost?.title || 'Chỉnh sửa'}
              </button>
            )}
            {canDeletePost(post) && (
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting(post.id)}
                className="w-full px-4 py-2 text-left flex items-center gap-2 transition-colors disabled:opacity-50"
                style={{ color: theme.status.error }}
                onMouseEnter={(e) => {
                  if (!isDeleting(post.id)) {
                    e.currentTarget.style.backgroundColor = theme.background.weakHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting(post.id)
                  ? (messages.loading || 'Đang xóa...')
                  : (messages.notifications?.actions?.delete || 'Xóa')
                }
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <PostModal
        post={post}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialImageIndex={modalImageIndex}
      />

      {/* Edit Post Modal - Only render if user can edit */}
      {canEditPost(post) && (
        <EditPostModal
          post={post}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
