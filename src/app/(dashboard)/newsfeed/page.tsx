"use client";

import React from "react";
import { NewsfeedProvider, useNewsfeedContext } from "@/contexts";
import { CreatePostCard, PostCard } from "@/components/posts";
import { FriendList } from "./components";
import { useAuth } from '@/components/auth/AuthProvider';

// Separate component for the newsfeed content that uses the context
function NewsfeedContent() {
	const {
		posts,
		isLoading,
		isLoadingMore,
		pagination,
		loadMore,
		refresh,
		toggleLike,
		updatePost,
		error
	} = useNewsfeedContext();

	const { user } = useAuth();

	// Handle like toggle
	const handleLikeToggle = async (postId: number) => {
		try {
			await toggleLike(postId);
		} catch (error) {
			console.error("Error toggling like:", error);
			// You can add toast notification here
		}
	};

	// Handle refresh
	const handleRefresh = async () => {
		try {
			await refresh();
		} catch (error) {
			console.error("Error refreshing posts:", error);
		}
	};

	// Show error state
	if (error && posts.length === 0) {
		return (
			<div className="flex-1 max-w-2xl mx-auto px-4 py-6">
				<div className="text-center py-8">
					<p className="text-red-500 mb-4">Có lỗi xảy ra khi tải bài viết</p>
					<button
						onClick={handleRefresh}
						className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Thử lại
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex max-w-7xl mx-auto">
			{/* Main Content Area */}
			<div className="flex-1 max-w-2xl mx-auto px-4 py-6">
				{/* Create Post Section */}
				<div className="mb-6">
					<CreatePostCard
						userName={user?.name || "User"}
						userAvatar={user?.avatar}
						placeholder="What's on your mind?"
					/>
				</div>

				{/* Pull to refresh indicator */}
				<div className="mb-4 text-center">
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
					>
						{isLoading ? "Đang tải..." : "Làm mới bài viết"}
					</button>
				</div>

				{/* Posts Feed */}
				<div className="space-y-4">
					{posts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
						/>
					))}
				</div>

				{/* Initial Loading State */}
				{isLoading && posts.length === 0 && (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
						<span className="ml-2 text-gray-500">Đang tải bài viết...</span>
					</div>
				)}

				{/* Load More Loading State */}
				{isLoadingMore && (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
						<span className="ml-2 text-gray-500">Đang tải thêm...</span>
					</div>
				)}

				{/* Load More Button */}
				{pagination.hasMore && !isLoadingMore && !isLoading && (
					<div className="text-center mt-8">
						<button
							onClick={loadMore}
							className="px-6 py-2 text-gray-400 hover:text-gray-300 border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
						>
							Tải thêm bài viết
						</button>
					</div>
				)}

				{/* End of Feed */}
				{!pagination.hasMore && posts.length > 0 && (
					<div className="text-center mt-8 py-4">
						<p className="text-gray-500 dark:text-gray-400 text-sm">
							🎉 Bạn đã xem hết {pagination.totalElements} bài viết
						</p>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && posts.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
							Chưa có bài viết nào
						</p>
						<p className="text-gray-400 dark:text-gray-500 text-sm">
							Hãy tạo bài viết đầu tiên của bạn!
						</p>
					</div>
				)}
			</div>

			{/* Right Sidebar - Friends List */}
			<div className="hidden lg:block w-80 fixed right-0 top-15 h-screen overflow-y-auto">
				<div className="pt-20 pr-4 pl-4 pb-4">
					<FriendList />
				</div>
			</div>
		</div>
	);
}

// Main page component with provider
export default function NewsFeedPage() {
	return (
		<NewsfeedProvider pageSize={10}>
			<NewsfeedContent />
		</NewsfeedProvider>
	);
}
