"use client";

import React, { useState } from "react";
import { DARK_THEME } from "@/constants/theme";
import { SIDEBAR_ICONS } from "@/constants/icons";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Calendar,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import Button from "@/components/ui/Button/Button";

// Mock data for news feed posts
const mockPosts = [
  {
    id: 1,
    author: {
      name: "Sarah Johnson",
      avatar: null,
      role: "Project Manager"
    },
    content: "Just completed the Q4 planning session! Excited about the new features we'll be rolling out next quarter. The team collaboration has been amazing! 🚀",
    timestamp: "2 hours ago",
    type: "update",
    likes: 12,
    comments: 5,
    shares: 2,
    hasLiked: false
  },
  {
    id: 2,
    author: {
      name: "Mike Chen",
      avatar: null,
      role: "Developer"
    },
    content: "New deployment completed successfully! The performance improvements are looking great. Response times are down by 30%. 💪",
    timestamp: "4 hours ago",
    type: "achievement",
    likes: 8,
    comments: 3,
    shares: 1,
    hasLiked: true,
    attachments: [
      {
        type: "image",
        url: "/images/chart-performance.png",
        title: "Performance Metrics"
      }
    ]
  },
  {
    id: 3,
    author: {
      name: "Lisa Wang",
      avatar: null,
      role: "Designer"
    },
    content: "Working on the new dashboard design. Love how the user experience is shaping up! Here's a sneak peek of the new interface. What do you think?",
    timestamp: "6 hours ago",
    type: "project_update",
    likes: 15,
    comments: 8,
    shares: 4,
    hasLiked: false
  },
  {
    id: 4,
    author: {
      name: "TaskFlow Team",
      avatar: null,
      role: "System"
    },
    content: "🎉 Milestone achieved! Our team has completed 500+ tasks this month. Great job everyone! Let's keep the momentum going.",
    timestamp: "1 day ago",
    type: "milestone",
    likes: 25,
    comments: 12,
    shares: 6,
    hasLiked: true
  }
];

const PostCard = ({ post }: { post: any }) => {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikesCount(hasLiked ? likesCount - 1 : likesCount + 1);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'milestone':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'project_update':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div
      className="border rounded-lg p-6 mb-4 transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: DARK_THEME.border.default
      }}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={post.author.name}
            size="md"
            className="flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="font-semibold text-sm"
                style={{ color: DARK_THEME.text.primary }}
              >
                {post.author.name}
              </h3>
              {getPostTypeIcon(post.type)}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: DARK_THEME.text.muted }}>
              <span>{post.author.role}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p
          className="text-sm leading-relaxed"
          style={{ color: DARK_THEME.text.secondary }}
        >
          {post.content}
        </p>
      </div>

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-4">
          {post.attachments.map((attachment: any, index: number) => (
            <div
              key={index}
              className="border rounded-lg p-3"
              style={{
                backgroundColor: DARK_THEME.background.tertiary,
                borderColor: DARK_THEME.border.default
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium" style={{ color: DARK_THEME.text.primary }}>
                  {attachment.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: DARK_THEME.border.default }}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              hasLiked 
                ? 'text-red-500 bg-red-500/10' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">{post.shares}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NewsFeedPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <SIDEBAR_ICONS.newsfeed className="w-6 h-6 text-orange-500" />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: DARK_THEME.text.primary }}
            >
              NewsFeed
            </h1>
          </div>
          <p
            className="text-sm"
            style={{ color: DARK_THEME.text.secondary }}
          >
            Stay updated with the latest team activities and achievements
          </p>
        </div>

        {/* Create Post Section */}
        <div
          className="border rounded-lg p-4 mb-6"
          style={{
            backgroundColor: DARK_THEME.background.secondary,
            borderColor: DARK_THEME.border.default
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar name="You" size="sm" />
            <input
              type="text"
              placeholder="Share an update with your team..."
              className="flex-1 px-3 py-2 rounded-lg border-none outline-none text-sm"
              style={{
                backgroundColor: DARK_THEME.background.tertiary,
                color: DARK_THEME.text.primary
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm">
              Share Update
            </Button>
          </div>
        </div>

        {/* Posts Feed */}
        <div>
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-gray-300"
          >
            Load more posts
          </Button>
        </div>
      </div>
    </div>
  );
}
