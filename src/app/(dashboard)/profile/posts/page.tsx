"use client";

import React, { useState } from "react";
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import Button from "@/components/ui/Button/Button";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Heart,
  MessageCircle,
  Share,
  Video,
  ImageIcon,
  Smile,
  MapPin,
  Edit3,
  CheckCircle
} from "lucide-react";

// Mock posts data
const mockPosts = [
  {
    id: 1,
    author: "Admin",
    content: "I hate dependency",
    timestamp: "2 days ago",
    likes: 7,
    comments: 1,
    liked: true,
    verified: true,
    image: null
  },
  {
    id: 2,
    author: "Admin",
    content: "Just finished a great project! Really excited about the results 🚀",
    timestamp: "1 week ago",
    likes: 12,
    comments: 3,
    liked: false,
    verified: true,
    image: null
  }
];

export default function PostsPage() {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");

  const userData = {
    name: user?.name || "Admin",
    email: user?.email || "cuonglv.21ad@vku.udn.vn",
    avatar: user?.avatar,
    bio: "Tranquility of mind",
    location: "somewhere"
  };

  return (
    <div className="p-3">
      <div className="flex gap-3 max-w-5xl mx-auto">
        {/* Left Column - Intro & Photos */}
        <div className="w-64 flex-shrink-0 space-y-2">
          {/* Intro Card */}
          <BaseCard
            title="Intro"
            onMenuClick={() => console.log("Intro menu")}
            variant="compact"
          >
            <div className="space-y-3">
              {/* Bio */}
              <div className="text-center">
                <p className="text-gray-300 text-base mb-3">{userData.bio}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit bio
                </Button>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>From {userData.location}</span>
              </div>
            </div>
          </BaseCard>

          {/* Photos Card */}
          <BaseCard
            title="Photo"
            onMenuClick={() => console.log("Photos menu")}
            variant="compact"
          >
            <div className="grid grid-cols-3 gap-1.5">
              {/* Demo photos - 6 items in 3x2 grid */}
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square bg-slate-600 rounded-md overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </BaseCard>
        </div>

        {/* Right Column - Posts */}
        <div className="flex-1 space-y-3">
          {/* Post Composer */}
          <BaseCard
            title=""
            onMenuClick={() => console.log("Composer menu")}
            variant="compact"
          >
            <div className="space-y-3">
              {/* Post Input */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  KE
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's on your mind, Admin?"
                    className="w-full p-2.5 bg-slate-600 rounded-full text-white placeholder-gray-400 border-0 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-red-500 hover:bg-gray-700 px-2 py-1.5 rounded-md transition-colors">
                    <Video className="w-4 h-4" />
                    <span className="text-xs font-medium">Video</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-green-500 hover:bg-gray-700 px-2 py-1.5 rounded-md transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Photo</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-yellow-500 hover:bg-gray-700 px-2 py-1.5 rounded-md transition-colors">
                    <Smile className="w-4 h-4" />
                    <span className="text-xs font-medium">Feeling</span>
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!postContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-1.5 text-sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </BaseCard>

          {/* Posts Feed */}
          {mockPosts.map((post) => (
            <BaseCard
              key={post.id}
              title=""
              onMenuClick={() => console.log(`Post ${post.id} menu`)}
              variant="compact"
            >
              <div className="space-y-3">
                {/* Post Header */}
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={userData.name}
                    size="sm"
                    fallbackColor="bg-gradient-to-br from-blue-500 to-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white text-sm">{post.author}</h3>
                      {post.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{post.timestamp}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  <p className="text-white text-sm leading-relaxed">{post.content}</p>
                </div>

                {/* Post Stats */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span>You and {post.likes - 1} others</span>
                  </div>
                  <div>
                    <span>{post.comments} comment{post.comments !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <button 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-xs font-medium ${
                      post.liked 
                        ? 'text-red-500 bg-red-500/10' 
                        : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-400 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors text-xs font-medium">
                    <MessageCircle className="w-4 h-4" />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-gray-400 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors text-xs font-medium">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </BaseCard>
          ))}
        </div>
      </div>
    </div>
  );
}
