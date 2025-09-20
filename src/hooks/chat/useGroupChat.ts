"use client";

import { useState, useCallback } from 'react';
import { chatService } from '@/services/chat';
import {
  FriendForGroupChat,
  ChatConversation,
  AddMembersResponse,
  RemoveMemberResponse,
  LeaveConversationResponse,
  ConversationMemberDto
} from '@/types/chat';
import { toast } from 'react-hot-toast';

export interface UseGroupChatReturn {
  // Friends management for group creation
  friends: FriendForGroupChat[];
  loadingFriends: boolean;
  loadFriendsForGroupChat: () => Promise<void>;
  toggleFriendSelection: (friendId: number) => void;
  clearFriendSelections: () => void;
  getSelectedFriends: () => FriendForGroupChat[];

  // Group creation
  creatingGroup: boolean;
  createGroupChat: (
    name: string,
    selectedFriendIds: number[],
    description?: string,
    avatarUrl?: string
  ) => Promise<ChatConversation | null>;
  createGroupChatWithUserIds: (
    name: string,
    memberIds: number[],
    description?: string,
    avatarUrl?: string
  ) => Promise<ChatConversation | null>;

  // Member management
  managingMembers: boolean;
  addMembersToGroup: (conversationId: number, userIds: number[]) => Promise<AddMembersResponse | null>;
  removeMemberFromGroup: (conversationId: number, memberId: number) => Promise<RemoveMemberResponse | null>;
  leaveGroup: (conversationId: number) => Promise<LeaveConversationResponse | null>;
  getConversationMembers: (conversationId: number) => Promise<ConversationMemberDto[]>;
  updateMemberRole: (
    conversationId: number,
    memberId: number,
    role: 'ADMIN' | 'MEMBER'
  ) => Promise<ConversationMemberDto | null>;

  // State management callbacks
  onConversationCreated?: (conversation: ChatConversation) => void;
  onMembersAdded?: (conversationId: number, response: AddMembersResponse) => void;
  onMemberRemoved?: (conversationId: number, response: RemoveMemberResponse) => void;
  onConversationLeft?: (conversationId: number) => void;
}

export const useGroupChat = (
  callbacks?: {
    onConversationCreated?: (conversation: ChatConversation) => void;
    onMembersAdded?: (conversationId: number, response: AddMembersResponse) => void;
    onMemberRemoved?: (conversationId: number, response: RemoveMemberResponse) => void;
    onConversationLeft?: (conversationId: number) => void;
  }
): UseGroupChatReturn => {
  // ==================== STATES ====================
  const [friends, setFriends] = useState<FriendForGroupChat[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [managingMembers, setManagingMembers] = useState(false);

  // ==================== FRIENDS MANAGEMENT ====================

  /**
   * Load friends list for group chat creation
   * Fetches from /api/chat/friends/for-group-chat
   */
  const loadFriendsForGroupChat = useCallback(async () => {
    if (loadingFriends) return;

    setLoadingFriends(true);
    try {
      const friendsList = await chatService.getFriendsForGroupChat();
      setFriends(friendsList.map(friend => ({ ...friend, isSelected: false })));
    } catch (error) {
      console.error('Failed to load friends for group chat:', error);
      throw error;
    } finally {
      setLoadingFriends(false);
    }
  }, [loadingFriends]);

  /**
   * Toggle friend selection for group creation
   */
  const toggleFriendSelection = useCallback((friendId: number) => {
    setFriends(prev => prev.map(friend =>
      friend.id === friendId ? { ...friend, isSelected: !friend.isSelected } : friend
    ));
  }, []);

  /**
   * Clear all friend selections
   */
  const clearFriendSelections = useCallback(() => {
    setFriends(prev => prev.map(friend => ({ ...friend, isSelected: false })));
  }, []);

  /**
   * Get currently selected friends
   */
  const getSelectedFriends = useCallback(() => {
    return friends.filter(friend => friend.isSelected);
  }, [friends]);

  // ==================== GROUP CREATION ====================

  /**
   * Create group chat with selected friends using the from-friends endpoint
   * Uses POST /api/chat/conversations/group/from-friends
   */
  const createGroupChat = useCallback(async (
    name: string,
    selectedFriendIds: number[],
    description?: string,
    avatarUrl?: string
  ): Promise<ChatConversation | null> => {
    if (creatingGroup) return null;

    setCreatingGroup(true);
    try {
      const request = {
        name,
        description,
        avatarUrl,
        friendIds: selectedFriendIds
      };

      const newConversation = await chatService.createGroupConversationFromFriends(request);

      // Show success toast
      toast.success(`Group chat "${name}" created successfully! 🎉`, {
        duration: 4000,
        position: 'top-right',
      });

      // Clear friend selections after successful creation
      clearFriendSelections();

      // Trigger callback if provided
      if (callbacks?.onConversationCreated) {
        callbacks.onConversationCreated(newConversation);
      }

      return newConversation;
    } catch (error) {
      console.error('Failed to create group chat:', error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group chat';
      toast.error(`Failed to create group: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
      });

      throw error;
    } finally {
      setCreatingGroup(false);
    }
  }, [creatingGroup, clearFriendSelections, callbacks]);

  /**
   * Create group chat with specific user IDs (not necessarily friends)
   * Uses POST /api/chat/conversations/group
   */
  const createGroupChatWithUserIds = useCallback(async (
    name: string,
    memberIds: number[],
    description?: string,
    avatarUrl?: string
  ): Promise<ChatConversation | null> => {
    if (creatingGroup) return null;

    setCreatingGroup(true);
    try {
      const request = {
        name,
        description,
        avatarUrl,
        memberIds
      };

      const newConversation = await chatService.createGroupConversation(request);

      // Show success toast
      toast.success(`Group chat "${name}" created successfully! 🎉`, {
        duration: 4000,
        position: 'top-right',
      });

      // Trigger callback if provided
      if (callbacks?.onConversationCreated) {
        callbacks.onConversationCreated(newConversation);
      }

      return newConversation;
    } catch (error) {
      console.error('Failed to create group chat with user IDs:', error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group chat';
      toast.error(`Failed to create group: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
      });

      throw error;
    } finally {
      setCreatingGroup(false);
    }
  }, [creatingGroup, callbacks]);

  // ==================== MEMBER MANAGEMENT ====================

  /**
   * Add members to existing group conversation
   */
  const addMembersToGroup = useCallback(async (
    conversationId: number,
    userIds: number[]
  ): Promise<AddMembersResponse | null> => {
    if (managingMembers) return null;

    setManagingMembers(true);
    try {
      const response = await chatService.addMembersToConversation(conversationId, { userIds });

      // Show success toast
      const memberCount = response.members.length;
      toast.success(`Successfully added ${memberCount} member${memberCount > 1 ? 's' : ''} to the group! 👥`, {
        duration: 3000,
        position: 'top-right',
      });

      // Trigger callback if provided
      if (callbacks?.onMembersAdded) {
        callbacks.onMembersAdded(conversationId, response);
      }

      return response;
    } catch (error) {
      console.error('Failed to add members to group:', error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to add members';
      toast.error(`Failed to add members: ${errorMessage}`, {
        duration: 4000,
        position: 'top-right',
      });

      throw error;
    } finally {
      setManagingMembers(false);
    }
  }, [managingMembers, callbacks]);

  /**
   * Remove member from group conversation
   */
  const removeMemberFromGroup = useCallback(async (
    conversationId: number,
    memberId: number
  ): Promise<RemoveMemberResponse | null> => {
    if (managingMembers) return null;

    setManagingMembers(true);
    try {
      const response = await chatService.removeMemberFromConversation(conversationId, memberId);

      // Show success toast
      toast.success('Member removed from group successfully! 👋', {
        duration: 3000,
        position: 'top-right',
      });

      // Trigger callback if provided
      if (callbacks?.onMemberRemoved) {
        callbacks.onMemberRemoved(conversationId, response);
      }

      return response;
    } catch (error) {
      console.error('Failed to remove member from group:', error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      toast.error(`Failed to remove member: ${errorMessage}`, {
        duration: 4000,
        position: 'top-right',
      });

      throw error;
    } finally {
      setManagingMembers(false);
    }
  }, [managingMembers, callbacks]);

  /**
   * Leave group conversation
   */
  const leaveGroup = useCallback(async (
    conversationId: number
  ): Promise<LeaveConversationResponse | null> => {
    if (managingMembers) return null;

    setManagingMembers(true);
    try {
      const response = await chatService.leaveConversation(conversationId);

      // Show success toast
      toast.success('You have left the group successfully! 🚪', {
        duration: 3000,
        position: 'top-right',
      });

      // Trigger callback if provided
      if (callbacks?.onConversationLeft) {
        callbacks.onConversationLeft(conversationId);
      }

      return response;
    } catch (error) {
      console.error('Failed to leave group:', error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave group';
      toast.error(`Failed to leave group: ${errorMessage}`, {
        duration: 4000,
        position: 'top-right',
      });

      throw error;
    } finally {
      setManagingMembers(false);
    }
  }, [managingMembers, callbacks]);

  /**
   * Get conversation members
   */
  const getConversationMembers = useCallback(async (
    conversationId: number
  ): Promise<ConversationMemberDto[]> => {
    try {
      return await chatService.getConversationMembers(conversationId);
    } catch (error) {
      console.error('Failed to get conversation members:', error);
      throw error;
    }
  }, []);

  /**
   * Update member role in conversation
   */
  const updateMemberRole = useCallback(async (
    conversationId: number,
    memberId: number,
    role: 'ADMIN' | 'MEMBER'
  ): Promise<ConversationMemberDto | null> => {
    if (managingMembers) return null;

    setManagingMembers(true);
    try {
      const response = await chatService.updateMemberRole(conversationId, memberId, role);

      // Show success toast
      const roleName = role === 'ADMIN' ? 'Administrator' : 'Member';
      toast.success(`Member role updated to ${roleName} successfully! 🔄`, {
        duration: 3000,
        position: 'top-right',
      });

      return response;
    } catch (error) {
      console.error('Failed to update member role:', error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to update member role';
      toast.error(`Failed to update role: ${errorMessage}`, {
        duration: 4000,
        position: 'top-right',
      });

      throw error;
    } finally {
      setManagingMembers(false);
    }
  }, [managingMembers]);

  // ==================== RETURN OBJECT ====================

  return {
    // Friends management for group creation
    friends,
    loadingFriends,
    loadFriendsForGroupChat,
    toggleFriendSelection,
    clearFriendSelections,
    getSelectedFriends,

    // Group creation
    creatingGroup,
    createGroupChat,
    createGroupChatWithUserIds,

    // Member management
    managingMembers,
    addMembersToGroup,
    removeMemberFromGroup,
    leaveGroup,
    getConversationMembers,
    updateMemberRole
  };
};
