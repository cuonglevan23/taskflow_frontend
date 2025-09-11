"use client";

import { useState, useEffect, useCallback } from 'react';
import { chatService } from '@/services/chat';
import { FriendForGroupChat, UseFriendsReturn } from '@/types/chat';

export function useFriends(): UseFriendsReturn {
  const [friends, setFriends] = useState<FriendForGroupChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const friendsData = await chatService.getFriendsForGroupChat();
      setFriends(friendsData);
    } catch (err) {
      console.error('Failed to load friends:', err);
      setError('Failed to load friends. Please try again.');

      // Fallback to mock data for development
      setFriends([
        {
          id: 1,
          name: 'Aaryian Jose',
          email: 'aaryian.jose@example.com',
          avatarUrl: '/images/avatar1.jpg',
          isOnline: true,
          isSelected: false
        },
        {
          id: 2,
          name: 'Sarika Jain',
          email: 'sarika.jain@example.com',
          avatarUrl: '/images/avatar2.jpg',
          isOnline: true,
          isSelected: false
        },
        {
          id: 3,
          name: 'Clyde Smith',
          email: 'clyde.smith@example.com',
          avatarUrl: '/images/avatar3.jpg',
          isOnline: false,
          isSelected: false
        },
        {
          id: 4,
          name: 'Carla Jenkins',
          email: 'carla.jenkins@example.com',
          avatarUrl: '/images/avatar4.jpg',
          isOnline: true,
          isSelected: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const refetch = useCallback(async () => {
    await loadFriends();
  }, [loadFriends]);

  // Auto-load friends on mount
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return {
    friends,
    loading,
    error,
    refetch
  };
}
