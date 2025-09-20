"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/services/chat';
import { FriendForGroupChat, UseFriendsReturn } from '@/types/chat';
import { useAuth } from '@/components/auth/AuthProvider'; // ✅ ADD: Import useAuth

// Configuration constants
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000,  // 5 seconds
} as const;

// Enhanced hook with retry logic and better error handling + authentication guard
export function useFriends(): UseFriendsReturn {
  const [friends, setFriends] = useState<FriendForGroupChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ADD: Authentication guard
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Use refs to prevent race conditions and track state
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Enhanced sleep function for retry delays
  const sleep = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), []);

  // Calculate exponential backoff delay
  const getRetryDelay = useCallback((attemptNumber: number): number => {
    const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attemptNumber - 1);
    const jitteredDelay = exponentialDelay + Math.random() * 1000; // Add jitter
    return Math.min(jitteredDelay, RETRY_CONFIG.maxDelay);
  }, []);

  // Enhanced loadFriends with authentication guard
  const loadFriends = useCallback(async (forceReload = false) => {
    // ✅ ADD: Skip if not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      setError(null);
      setFriends([]);
      return;
    }

    // Prevent multiple concurrent calls
    if (isLoadingRef.current && !forceReload) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        // Check if component is still mounted
        if (!mountedRef.current) return;

        const friendsData = await chatService.getFriendsForGroupChat();

        // Check again if component is still mounted before updating state
        if (!mountedRef.current) return;

        setFriends(friendsData);
        retryCountRef.current = 0; // Reset retry count on success
        return; // Success - exit retry loop

      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error occurred');

        // Check if it's an authentication error - don't retry
        if (lastError.message.includes('Unauthorized')) {
          setError('Please log in to load friends');
          break;
        }

        // Check if it's a network error that might be temporary
        const isRetryableError =
          lastError.message.includes('Network') ||
          lastError.message.includes('timeout') ||
          lastError.message.includes('Failed to fetch') ||
          lastError.message.includes('ERR_NETWORK');

        // If it's the last attempt or non-retryable error, break
        if (attempt === RETRY_CONFIG.maxRetries || !isRetryableError) {
          break;
        }

        // Wait before retrying (with exponential backoff)
        const delay = getRetryDelay(attempt);
        await sleep(delay);

        // Check if component is still mounted before continuing
        if (!mountedRef.current) return;
      }
    }

    // If we reach here, all retries failed
    if (lastError) {
      if (lastError.message.includes('Unauthorized')) {
        setError('Please log in to load friends');
      } else {
        setError(`Failed to load friends after ${RETRY_CONFIG.maxRetries} attempts. Please try again.`);

        // Provide fallback mock data for development (only for non-auth errors)
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
      }
    }
  }, [isAuthenticated]); // ✅ ADD: Include isAuthenticated in dependencies

  // Enhanced refetch function with force reload option
  const refetch = useCallback(async () => {
    retryCountRef.current = 0; // Reset retry count for manual refetch
    await loadFriends(true); // Force reload
  }, [loadFriends]);

  // Cleanup loading state
  useEffect(() => {
    return () => {
      setLoading(false);
      isLoadingRef.current = false;
    };
  }, []);

  // Auto-load friends on mount only once
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadFriends();
    } else if (!authLoading && !isAuthenticated) {
      // Clear friends when not authenticated
      setFriends([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, authLoading, loadFriends]);

  return {
    friends,
    loading,
    error,
    refetch
  };
}
