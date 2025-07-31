"use client";

import { useState, useCallback } from "react";

export interface InboxNotification {
  id: string;
  type: "task" | "project" | "message" | "reminder" | "system";
  title: string;
  content?: string;
  time: string;
  isRead: boolean;
  isBookmarked?: boolean;
  avatar?: string;
}

export interface InboxActions {
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  bookmark: (id: string) => void;
  unbookmark: (id: string) => void;
  archive: (id: string) => void;
  showMoreActions: (id: string) => void;
}

// Helper functions for localStorage
const saveToLocalStorage = (key: string, data: InboxNotification[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const getFromLocalStorage = (key: string): InboxNotification[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

const addToBookmarks = (notification: InboxNotification) => {
  const bookmarked = getFromLocalStorage("bookmarkedNotifications");
  const exists = bookmarked.find(n => n.id === notification.id);
  
  if (!exists) {
    const updatedBookmarks = [...bookmarked, { ...notification, isBookmarked: true }];
    saveToLocalStorage("bookmarkedNotifications", updatedBookmarks);
  }
};

const removeFromBookmarks = (notificationId: string) => {
  const bookmarked = getFromLocalStorage("bookmarkedNotifications");
  const filtered = bookmarked.filter(n => n.id !== notificationId);
  saveToLocalStorage("bookmarkedNotifications", filtered);
};

const addToArchive = (notification: InboxNotification) => {
  const archived = getFromLocalStorage("archivedNotifications");
  const exists = archived.find(n => n.id === notification.id);
  
  if (!exists) {
    const updatedArchive = [...archived, notification];
    saveToLocalStorage("archivedNotifications", updatedArchive);
  }
};

export const useInboxActions = (
  notifications: InboxNotification[],
  onUpdate?: (notifications: InboxNotification[]) => void
) => {
  const [items, setItems] = useState<InboxNotification[]>(notifications);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);

  const updateItems = useCallback((updatedItems: InboxNotification[]) => {
    setItems(updatedItems);
    onUpdate?.(updatedItems);
  }, [onUpdate]);

  const setItemLoading = useCallback((id: string, isLoading: boolean) => {
    setLoading(prev => ({
      ...prev,
      [id]: isLoading
    }));
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setItemLoading(id, true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, isRead: true } : item
      );
      updateItems(updatedItems);
      
      // Update bookmarks if this notification is bookmarked
      const notification = items.find(n => n.id === id);
      if (notification?.isBookmarked) {
        const bookmarked = getFromLocalStorage("bookmarkedNotifications");
        const updatedBookmarks = bookmarked.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        saveToLocalStorage("bookmarkedNotifications", updatedBookmarks);
      }
      
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setItemLoading(id, false);
    }
  }, [items, updateItems, setItemLoading]);

  const markAsUnread = useCallback(async (id: string) => {
    setItemLoading(id, true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, isRead: false } : item
      );
      updateItems(updatedItems);
      
      // Update bookmarks if this notification is bookmarked
      const notification = items.find(n => n.id === id);
      if (notification?.isBookmarked) {
        const bookmarked = getFromLocalStorage("bookmarkedNotifications");
        const updatedBookmarks = bookmarked.map(n => 
          n.id === id ? { ...n, isRead: false } : n
        );
        saveToLocalStorage("bookmarkedNotifications", updatedBookmarks);
      }
      
    } catch (error) {
      console.error("Failed to mark as unread:", error);
    } finally {
      setItemLoading(id, false);
    }
  }, [items, updateItems, setItemLoading]);

  const bookmark = useCallback(async (id: string) => {
    setItemLoading(id, true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const notification = items.find(n => n.id === id);
      if (notification) {
        // Add to bookmarks
        addToBookmarks(notification);
        
        // Update current items
        const updatedItems = items.map(item =>
          item.id === id ? { ...item, isBookmarked: true } : item
        );
        updateItems(updatedItems);
      }
      
      console.log("Bookmarked notification:", id);
    } catch (error) {
      console.error("Failed to bookmark:", error);
    } finally {
      setItemLoading(id, false);
    }
  }, [items, updateItems, setItemLoading]);

  const unbookmark = useCallback(async (id: string) => {
    setItemLoading(id, true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from bookmarks
      removeFromBookmarks(id);
      
      // Update current items
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, isBookmarked: false } : item
      );
      updateItems(updatedItems);
      
      console.log("Unbookmarked notification:", id);
    } catch (error) {
      console.error("Failed to unbookmark:", error);
    } finally {
      setItemLoading(id, false);
    }
  }, [items, updateItems, setItemLoading]);

  const archive = useCallback(async (id: string) => {
    setItemLoading(id, true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const notification = items.find(n => n.id === id);
      if (notification) {
        // Add to archive
        addToArchive(notification);
        
        // Remove from bookmarks if it was bookmarked
        if (notification.isBookmarked) {
          removeFromBookmarks(id);
        }
      }
      
      // Remove from current items
      const updatedItems = items.filter(item => item.id !== id);
      updateItems(updatedItems);
      
      console.log("Archived notification:", id);
    } catch (error) {
      console.error("Failed to archive:", error);
    } finally {
      setItemLoading(id, false);
    }
  }, [items, updateItems, setItemLoading]);

  const showMoreActions = useCallback((id: string) => {
    setShowMoreMenu(showMoreMenu === id ? null : id);
  }, [showMoreMenu]);

  const hideMoreActions = useCallback(() => {
    setShowMoreMenu(null);
  }, []);

  const actions: InboxActions = {
    markAsRead,
    markAsUnread,
    bookmark,
    unbookmark,
    archive,
    showMoreActions,
  };

  return {
    notifications: items,
    actions,
    loading,
    showMoreMenu,
    hideMoreActions,
    isLoading: (id: string) => loading[id] || false,
  };
}; 