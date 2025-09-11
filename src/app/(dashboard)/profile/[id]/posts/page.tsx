"use client";

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import Button from "@/components/ui/Button/Button";
import { useAuth } from '@/components/auth/AuthProvider';
import { CreatePostCard, PostCard } from "@/components/posts";
import { useUserPosts } from "@/hooks";
import {
  ImageIcon,
  Calendar,
  Briefcase,
  Edit3,
  Loader2,
  Plus
} from "lucide-react";

// Profile data interface
interface ProfileData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  department?: string;
  jobTitle?: string;
  aboutMe?: string;
  joinedAt: string;
  isPremium: boolean;
}

export default function UserPostsPage() {
  const { id: userId } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = !userId || userId === "me" || (user && userId === user.id?.toString());

  // Load profile data from API
  const loadProfileData = async () => {
    setLoading(true);
    try {
      let response;

      if (isOwnProfile) {
        // Load own profile
        response = await fetch('/api/user-profiles/me/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          response = await fetch('/api/user-profiles/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            }
          });
        }
      } else {
        // Load other user's profile
        response = await fetch(`/api/user-profiles/user/${userId}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
      }

      if (response.ok) {
        const apiData = await response.json();
        const mappedProfile: ProfileData = {
          id: apiData.id || 0,
          email: apiData.email || user?.email || "",
          firstName: apiData.firstName || user?.name?.split(' ')[0] || "User",
          lastName: apiData.lastName || user?.name?.split(' ').slice(1).join(' ') || "",
          username: apiData.username || "user",
          avatarUrl: apiData.avatarUrl || apiData.avtUrl || user?.avatar || null,
          department: apiData.department,
          jobTitle: apiData.jobTitle,
          aboutMe: apiData.aboutMe,
          joinedAt: apiData.joinedAt || new Date().toISOString(),
          isPremium: apiData.premium || apiData.isPremium || false
        };
        setProfileData(mappedProfile);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      // Create fallback profile data
      const fallbackProfile: ProfileData = {
        id: 0,
        email: user?.email || "user@example.com",
        firstName: isOwnProfile ? (user?.name?.split(' ')[0] || "User") : "Unknown",
        lastName: isOwnProfile ? (user?.name?.split(' ').slice(1).join(' ') || "") : "User",
        username: "user",
        avatarUrl: user?.avatar || null,
        department: "Engineering",
        jobTitle: "Team Member",
        aboutMe: isOwnProfile ? "Welcome to TaskFlow!" : "This user hasn't added a bio yet.",
        joinedAt: new Date().toISOString(),
        isPremium: false
      };
      setProfileData(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  // Use custom hook for posts with automatic cache management
  const profileUserId = profileData?.id || (isOwnProfile ? (user?.id ? parseInt(user.id) : 0) : parseInt(userId as string) || 0);

  const {
    posts,
    error: postsError,
    isLoading: postsLoading,
    mutate,
    isReachingEnd,
    isEmpty
  } = useUserPosts(profileUserId);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user, userId, isOwnProfile]);

  const formatJoinDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Recently joined';
    }
  };

  if (loading) {
    return (
      <div className="p-3 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
            <div className="space-y-4">
              {/* Bio */}
              {profileData?.aboutMe && profileData.aboutMe !== "No bio available" ? (
                <div className="text-center">
                  <p className="text-gray-300 text-base mb-3">{profileData.aboutMe}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-3">
                    {isOwnProfile ? "Add a bio to tell people about yourself" : "No bio yet"}
                  </p>
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                      onClick={() => console.log("Edit bio")}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Add Bio
                    </Button>
                  )}
                </div>
              )}

              {/* Job & Department - Only show if available and meaningful */}
              {profileData?.jobTitle && profileData.jobTitle !== "Team Member" && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {profileData.jobTitle}
                    {profileData.department && profileData.department !== "Unknown Department"
                      ? ` at ${profileData.department}`
                      : ''
                    }
                  </span>
                </div>
              )}

              {/* Join Date */}
              {profileData?.joinedAt && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Joined {formatJoinDate(profileData.joinedAt)}</span>
                </div>
              )}

              {/* Edit Details Button - Only for own profile */}
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => console.log("Edit details")}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit details
                </Button>
              )}
            </div>
          </BaseCard>


        </div>

        {/* Main Content Column */}
        <div className="flex-1 space-y-3">
          {/* Create Post Card - Only show for own profile */}
          {isOwnProfile && (
            <CreatePostCard
              userName={profileData ? `${profileData.firstName} ${profileData.lastName}` : user?.name || "User"}
              userAvatar={profileData?.avatarUrl || user?.avatar}
              placeholder="What's on your mind?"
            />
          )}

          {/* Posts Loading */}
          {postsLoading && posts.length === 0 && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          {/* Error State */}
          {postsError && (
            <BaseCard title="Posts" variant="compact">
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">Error loading posts</p>
                <p className="text-gray-500 text-sm">Please try refreshing the page</p>
              </div>
            </BaseCard>
          )}

          {/* Posts - No callbacks needed, all handled by hooks */}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))}

          {/* Load More Button */}
          {!isReachingEnd && posts.length > 0 && (
            <div className="flex justify-center py-4">
              <Button
                variant="ghost"
                onClick={() => mutate()}
                disabled={postsLoading}
                className="text-gray-400 hover:text-white"
              >
                {postsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </div>
          )}

          {/* No Posts Message */}
          {isEmpty && !postsLoading && (
            <BaseCard title="Posts" variant="compact">
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  {isOwnProfile ? "No posts yet" : "This user hasn't posted anything yet"}
                </p>
                <p className="text-gray-500 text-sm">
                  {isOwnProfile ? "Share your first post to get started!" : "Check back later for updates"}
                </p>
                {isOwnProfile && (
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => console.log("Create first post")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                )}
              </div>
            </BaseCard>
          )}
        </div>
      </div>
    </div>
  );
}
