"use client";

import React from "react";
import { NewsfeedProvider, useNewsfeedContext } from "@/contexts";
import { CreatePostCard, PostCard } from "@/components/posts";
import { FriendList } from "./components";
import { useAuth } from '@/components/auth/AuthProvider';
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

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
	const { theme, themeMode } = useThemeContext();
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

	// Dynamic theme-based classes
	const getThemeClasses = () => {
		const isDark = themeMode === 'dark';
		return {
			text: {
				primary: isDark ? 'text-white' : 'text-gray-900',
				secondary: isDark ? 'text-gray-400' : 'text-gray-600',
				muted: isDark ? 'text-gray-500' : 'text-gray-500',
				error: isDark ? 'text-red-400' : 'text-red-600'
			},
			background: {
				button: isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700',
				buttonSecondary: isDark ? 'text-gray-400 hover:text-gray-300 border-gray-600 hover:border-gray-500' : 'text-gray-600 hover:text-gray-700 border-gray-300 hover:border-gray-400'
			},
			spinner: isDark ? 'border-blue-500' : 'border-blue-600'
		};
	};

	const themeClasses = getThemeClasses();

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
					<p className={`mb-4 ${themeClasses.text.error}`}>
						{t('newsfeed.error.loadPosts')}
					</p>
					<button
						onClick={handleRefresh}
						className={`px-4 py-2 text-white rounded-lg transition-colors ${themeClasses.background.button}`}
					>
						{t('newsfeed.actions.retry')}
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
						placeholder={t('newsfeed.createPost.placeholder')}
					/>
				</div>

				{/* Pull to refresh indicator */}
				<div className="mb-4 text-center">
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className={`text-sm transition-colors ${themeClasses.text.secondary} hover:${themeClasses.text.primary}`}
					>
						{isLoading ? t('newsfeed.loading.refreshing') : t('newsfeed.actions.refresh')}
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
						<div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeClasses.spinner}`}></div>
						<span className={`ml-2 ${themeClasses.text.muted}`}>
							{t('newsfeed.loading.posts')}
						</span>
					</div>
				)}

				{/* Load More Loading State */}
				{isLoadingMore && (
					<div className="flex items-center justify-center py-8">
						<div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeClasses.spinner}`}></div>
						<span className={`ml-2 ${themeClasses.text.muted}`}>
							{t('newsfeed.loading.more')}
						</span>
					</div>
				)}

				{/* Load More Button */}
				{pagination.hasMore && !isLoadingMore && !isLoading && (
					<div className="text-center mt-8">
						<button
							onClick={loadMore}
							className={`px-6 py-2 border rounded-lg transition-colors ${themeClasses.background.buttonSecondary}`}
						>
							{t('newsfeed.actions.loadMore')}
						</button>
					</div>
				)}

				{/* End of Feed */}
				{!pagination.hasMore && posts.length > 0 && (
					<div className="text-center mt-8 py-4">
						<p className={`text-sm ${themeClasses.text.secondary}`}>
							{t('newsfeed.endOfFeed').replace('{count}', pagination.totalElements.toString())}
						</p>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && posts.length === 0 && (
					<div className="text-center py-12">
						<p className={`text-lg mb-4 ${themeClasses.text.secondary}`}>
							{t('newsfeed.empty.noPosts')}
						</p>
						<p className={`text-sm ${themeClasses.text.muted}`}>
							{t('newsfeed.empty.createFirst')}
						</p>
					</div>
				)}
			</div>

			{/* Right Sidebar - Friends List */}
			<div className="hidden lg:block w-80 fixed right-0 top-30 h-[calc(100vh-3rem)] overflow-y-auto z-30">
				<div className="pt-4 pr-4 pl-4 pb-4">
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
