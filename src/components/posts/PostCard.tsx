"use client";

import React from "react";
import Link from "next/link";
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import { PostData } from "@/services/postsService";
import { usePostCard, useSyncedPost } from "@/hooks/usePosts";

interface PostCardProps {
  post: PostData;
  showShareCount?: boolean;
}

export default function PostCard({
  post: initialPost,
  showShareCount = false
}: PostCardProps) {
  // Use synced post data that updates with SWR cache changes
  const post = useSyncedPost(initialPost);

  const {
    formatTimestamp,
    handleLike,
    handleComment,
    handleShare,
    handleAuthorClick,
    getImageAlt,
  } = usePostCard(post);

  return (
    <BaseCard variant="compact" title="">
      {/* Post Header */}
      <PostHeader
        authorName={post.authorName}
        authorAvatar={post.authorAvatar}
        isPremium={!!post.authorPremiumBadge}
        timestamp={formatTimestamp}
        onAuthorClick={handleAuthorClick}
      />

      {/* Pinned Indicator */}
      {post.isPinned && (
        <div className="mb-2" role="banner" aria-label="Pinned post">
          <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
            📌 Pinned Post
          </span>
        </div>
      )}

      {/* Linked Task/Project */}
      {(post.linkedTask || post.linkedProject) && (
        <aside
          className="mb-3 p-2 bg-gray-700/50 rounded border-l-4 border-blue-500"
          aria-label="Related content"
        >
          {post.linkedTask && (
            <div className="text-sm text-gray-300">
              <span role="img" aria-label="Task">🎯</span>
              <span className="font-medium ml-1">Task:</span>
              <Link
                href={`/tasks/${post.linkedTask.id}`}
                className="hover:text-blue-400 transition-colors ml-1"
                aria-label={`View task: ${post.linkedTask.title}`}
              >
                {post.linkedTask.title}
              </Link>
              <span
                className={`ml-2 px-2 py-0.5 rounded text-xs ${
                  post.linkedTask.status === 'COMPLETED' ? 'bg-green-600' : 'bg-blue-600'
                }`}
                aria-label={`Task status: ${post.linkedTask.status}`}
              >
                {post.linkedTask.status}
              </span>
            </div>
          )}
          {post.linkedProject && (
            <div className="text-sm text-gray-300">
              <span role="img" aria-label="Project">📁</span>
              <span className="font-medium ml-1">Project:</span>
              <Link
                href={`/projects/${post.linkedProject.id}`}
                className="hover:text-blue-400 transition-colors ml-1"
                aria-label={`View project: ${post.linkedProject.title}`}
              >
                {post.linkedProject.title}
              </Link>
            </div>
          )}
        </aside>
      )}

      {/* Post Content */}
      <article className="mb-4">
        <p className="text-white whitespace-pre-wrap" role="main">
          {post.content}
        </p>

        {/* Post Image */}
        {post.imageUrl && (
          <figure className="mt-3 rounded-lg overflow-hidden bg-gray-800">
            <img
              src={post.imageUrl}
              alt={getImageAlt()}
              className="w-full h-auto object-cover max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
              onClick={() => {
                // Open image in modal or new tab
                const link = document.createElement('a');
                link.href = post.imageUrl!;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.click();
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const container = target.parentElement;
                if (container) {
                  container.innerHTML = `
                    <div class="flex items-center justify-center h-32 bg-gray-700 text-gray-400">
                      <svg class="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm">Image not available</span>
                    </div>
                  `;
                }
              }}
            />
          </figure>
        )}
      </article>

      {/* Post Actions */}
      <PostActions
        likes={post.likesCount}
        comments={post.commentsCount}
        shares={0}
        isLiked={post.isLikedByCurrentUser}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        showShareCount={showShareCount}
      />
    </BaseCard>
  );
}
