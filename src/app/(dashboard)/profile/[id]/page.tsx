"use client";

import React from "react";
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function UserProfilePage() {
  const { id: userId } = useParams();
  const { user } = useAuth();

  // Check if viewing own profile
  const isOwnProfile = !userId || userId === "me" || (user && userId === user.id?.toString());

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">
          {isOwnProfile ? "Welcome to your profile!" : `Viewing profile for user ${userId}`}
        </p>
        <p className="text-gray-500 text-sm">
          Select a tab above to view content
        </p>
      </div>
    </div>
  );
}
