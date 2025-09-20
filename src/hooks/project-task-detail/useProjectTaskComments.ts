// Custom hook for project task comments management
import { useState, useEffect, useCallback } from 'react';
import { TaskListItem } from '@/components/TaskList/types';
import { ProjectTaskCommentsService, ProjectTaskCommentDto, CreateCommentRequest } from '@/services/tasks/projectTaskCommentsService';
import { useAuth } from '@/components/auth/AuthProvider';

// Custom Project Task Comment type to match TaskDetailPanel interface
export interface ProjectComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface UseProjectTaskCommentsProps {
  task: TaskListItem | null;
  isOpen: boolean;
}

export const useProjectTaskComments = ({ task, isOpen }: UseProjectTaskCommentsProps) => {
  const [projectComments, setProjectComments] = useState<ProjectComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const { user } = useAuth();

  // Convert ProjectTaskCommentDto to ProjectComment
  const convertComment = useCallback((comment: ProjectTaskCommentDto): ProjectComment => {
    let displayName = 'Unknown User';
    let displayEmail = 'unknown@email.com';
    let displayAvatar: string | null = null;

    // Handle multiple possible data structures from API
    if (comment.userName) {
      displayName = comment.userName;
      displayEmail = comment.userEmail || 'unknown@email.com';
      displayAvatar = comment.userAvatar || null;
    } else if (comment.authorName) {
      displayName = comment.authorName;
      displayEmail = comment.authorEmail || 'unknown@email.com';
      displayAvatar = comment.authorAvatar || null;
    }

    const currentUserId = user?.id;
    const commentUserId = comment.userId?.toString() || comment.authorId?.toString();

    return {
      id: comment.id.toString(),
      content: comment.content,
      author: {
        id: commentUserId || 'unknown',
        name: displayName,
        email: displayEmail,
        avatar: displayAvatar
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isEdited: comment.createdAt !== comment.updatedAt,
      canEdit: currentUserId?.toString() === commentUserId,
      canDelete: currentUserId?.toString() === commentUserId
    };
  }, [user]);

  // Fetch comments for the task
  const fetchComments = useCallback(async () => {
    if (!task?.id) return;

    setCommentsLoading(true);
    try {
      const comments = await ProjectTaskCommentsService.getCommentsByTask(Number(task.id));
      const convertedComments = comments.map(convertComment);
      setProjectComments(convertedComments);
    } catch (error) {
      console.error('Failed to fetch project task comments:', error);
      setProjectComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [task?.id, convertComment]);

  // Create new comment - wrapper function that uses newComment state (RESTORED FROM OLD CODE)
  const handleCreateComment = useCallback(async () => {
    if (!task?.id || !newComment.trim() || commentSubmitting) return;

    // Store original comment text for fallback
    const originalComment = newComment;

    try {
      setCommentSubmitting(true);
      const commentData: CreateCommentRequest = {
        taskId: Number(task.id),
        content: newComment.trim()
        // userId is automatically handled by the API from auth context
      };

      // Clear the input immediately for better UX
      setNewComment('');

      // Make the API call directly without optimistic update to avoid race conditions
      const createdComment = await ProjectTaskCommentsService.createComment(commentData);

      // Add the real comment to the beginning of the list
      const convertedComment = convertComment(createdComment);

      setProjectComments(prev => {
        const updated = [convertedComment, ...prev];
        return updated;
      });

      // Refresh activities to show the comment creation activity
      setTimeout(() => {
        // Trigger activity refresh if available
        fetchComments(); // Also refresh to ensure consistency
      }, 500);
    } catch (error) {
      console.error('Failed to create comment:', error);

      // Restore the comment text so user can try again
      setNewComment(originalComment);

      // Show error message
      alert('Failed to create comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  }, [task?.id, newComment, commentSubmitting, convertComment, fetchComments]);

  // Create comment with content parameter - internal function
  const createCommentWithContent = useCallback(async (content: string) => {
    if (!task?.id || !content.trim()) return;

    setCommentSubmitting(true);
    try {
      const createRequest: CreateCommentRequest = {
        content: content.trim(),
        taskId: Number(task.id)
        // userId is automatically handled by the API from auth context
      };

      await ProjectTaskCommentsService.createComment(createRequest);

      // Refresh comments after creation
      await fetchComments();
    } catch (error) {
      console.error('Failed to create project task comment:', error);
    } finally {
      setCommentSubmitting(false);
    }
  }, [task?.id, fetchComments]);

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await ProjectTaskCommentsService.deleteComment(Number(commentId));

      // Refresh comments after deletion
      await fetchComments();
    } catch (error) {
      console.error('Failed to delete project task comment:', error);
    }
  }, [fetchComments]);

  // Edit comment handlers
  const handleEditComment = useCallback((commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(currentContent);
  }, []);

  const handleEditCommentSubmit = useCallback(async () => {
    if (!editingCommentId || !editingCommentContent.trim()) return;

    try {
      await ProjectTaskCommentsService.updateComment(Number(editingCommentId), {
        content: editingCommentContent.trim()
      });

      // Refresh comments after update
      await fetchComments();

      // Reset editing state
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch (error) {
      console.error('Failed to update project task comment:', error);
    }
  }, [editingCommentId, editingCommentContent, fetchComments]);

  const handleEditCommentCancel = useCallback(() => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  }, []);

  // Fetch comments when panel opens or task changes
  useEffect(() => {
    if (isOpen && task?.id) {
      fetchComments();
    }
  }, [isOpen, task?.id, fetchComments]);

  return {
    // State
    projectComments,
    commentsLoading,
    newComment,
    commentSubmitting,
    editingCommentId,
    editingCommentContent,

    // Actions
    setNewComment,
    setEditingCommentContent,
    handleCreateComment,
    handleDeleteComment,
    handleEditComment,
    handleEditCommentSubmit,
    handleEditCommentCancel,
    fetchComments,
  };
};
