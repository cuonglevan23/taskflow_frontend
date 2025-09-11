"use client";

import { useState, useCallback, useEffect } from 'react';
import { ReactionType, MessageReaction, UseReactionsReturn } from '@/types/chat';
import { chatService } from '@/services/chat';

export const useReactions = (): UseReactionsReturn => {
  const [reactions, setReactions] = useState<Map<number, MessageReaction['updatedSummary']>>(new Map());
  const [loading, setLoading] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Any cleanup if needed
    };
  }, []);

  const toggleReaction = useCallback(async (messageId: number, reactionType: ReactionType) => {
    setLoading(prev => new Set(prev).add(messageId));
    setError(null);

    try {
      // Use chatService to toggle reaction - ensures correct API route handling
      const result = await chatService.toggleReaction(messageId, reactionType);

      // Update local state with the new reaction summary
      setReactions(prev => {
        const newMap = new Map(prev);
        newMap.set(messageId, result.updatedSummary);
        return newMap;
      });

    } catch (err) {
      if (err instanceof Error) {
        console.error('Failed to toggle reaction:', err);
        setError(err.message);
      }
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  }, []);

  const loadReactions = useCallback(async (messageId: number) => {
    setLoading(prev => new Set(prev).add(messageId));
    setError(null);

    try {
      // Use chatService to get message reactions - ensures correct API route handling
      const reactionSummary = await chatService.getMessageReactions(messageId);

      setReactions(prev => {
        const newMap = new Map(prev);
        newMap.set(messageId, reactionSummary);
        return newMap;
      });

    } catch (err) {
      if (err instanceof Error) {
        console.error('Failed to load reactions:', err);
        setError(err.message);
      }
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  }, []);

  const getReactions = useCallback((messageId: number) => {
    return reactions.get(messageId);
  }, [reactions]);

  const isLoading = useCallback((messageId: number) => {
    return loading.has(messageId);
  }, [loading]);

  return {
    toggleReaction,
    loadReactions,
    getReactions,
    isLoading,
    error
  };
};
