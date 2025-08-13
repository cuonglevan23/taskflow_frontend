"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from "react";

// Unified Notification Types - Senior Product Code
export type NotificationType = "task" | "project" | "message" | "reminder" | "system" | "info" | "warning" | "error" | "success";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type NotificationStatus = "unread" | "read" | "archived" | "bookmarked";

export interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  content?: string;
  message?: string; // For backward compatibility
  priority: NotificationPriority;
  status: NotificationStatus;
  timestamp: Date;
  
  // Optional metadata
  avatar?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  
  // Computed properties
  isRead: boolean;
  isBookmarked: boolean;
  isArchived: boolean;
}

export interface NotificationActions {
  // Core actions
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  
  // Organization actions
  bookmark: (id: string) => Promise<void>;
  unbookmark: (id: string) => Promise<void>;
  archive: (id: string) => Promise<void>;
  unarchive: (id: string) => Promise<void>;
  
  // CRUD actions
  addNotification: (notification: Omit<BaseNotification, 'id' | 'timestamp' | 'isRead' | 'isBookmarked' | 'isArchived'>) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  updateNotification: (id: string, updates: Partial<BaseNotification>) => Promise<void>;
  
  // Bulk actions
  bulkMarkAsRead: (ids: string[]) => Promise<void>;
  bulkArchive: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  
  // Real-time actions
  refreshNotifications: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

export interface NotificationFilters {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  status?: NotificationStatus[];
  dateRange?: { start: Date; end: Date };
  searchQuery?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  bookmarked: number;
  archived: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  recentCount: number; // Last 24 hours
}

interface NotificationContextType {
  // Data
  notifications: BaseNotification[];
  filteredNotifications: BaseNotification[];
  
  // State
  isLoading: boolean;
  error: string | null;
  filters: NotificationFilters;
  
  // Actions
  actions: NotificationActions;
  
  // Computed
  stats: NotificationStats;
  
  // UI State
  selectedNotifications: string[];
  showMoreMenu: string | null;
  
  // UI Actions
  setFilters: (filters: NotificationFilters) => void;
  setSelectedNotifications: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  showMoreActions: (id: string) => void;
  hideMoreActions: () => void;
}

// Create Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Storage utilities
const STORAGE_KEYS = {
  notifications: 'notifications',
  bookmarked: 'bookmarkedNotifications',
  archived: 'archivedNotifications',
} as const;

const saveToStorage = (key: string, data: unknown) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  }
  return defaultValue;
};

// Mock data for development
const INITIAL_NOTIFICATIONS: BaseNotification[] = [
  {
    id: "1",
    type: "task",
    title: "Task assigned to you",
    content: "Complete project proposal by end of week",
    priority: "high",
    status: "unread",
    timestamp: new Date(),
    avatar: "👤",
    actionUrl: "/tasks/1",
    actionText: "View Task",
    isRead: false,
    isBookmarked: false,
    isArchived: false,
  },
  {
    id: "2", 
    type: "project",
    title: "New project created",
    content: "Project Alpha has been created and you're assigned as PM",
    priority: "medium",
    status: "unread", 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    avatar: "📁",
    actionUrl: "/projects/alpha",
    actionText: "View Project",
    isRead: false,
    isBookmarked: false,
    isArchived: false,
  },
  {
    id: "3",
    type: "system",
    title: "System maintenance scheduled",
    content: "Scheduled maintenance on Sunday 2AM-4AM EST",
    priority: "low",
    status: "read",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    avatar: "⚙️",
    isRead: true,
    isBookmarked: false,
    isArchived: false,
  },
];

// Provider Props
interface NotificationProviderProps {
  children: ReactNode;
}

// Professional Notification Provider - Senior Product Implementation
export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  // State Management
  const [notifications, setNotifications] = useState<BaseNotification[]>(() => {
    const stored = getFromStorage(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS);
    // Ensure timestamps are Date objects
    return stored.map(notification => ({
      ...notification,
      timestamp: notification.timestamp instanceof Date 
        ? notification.timestamp 
        : new Date(notification.timestamp)
    }));
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);

  // Computed Values - Memoized for Performance
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply filters
    if (filters.type?.length) {
      filtered = filtered.filter(n => filters.type!.includes(n.type));
    }
    
    if (filters.priority?.length) {
      filtered = filtered.filter(n => filters.priority!.includes(n.priority));
    }
    
    if (filters.status?.length) {
      filtered = filtered.filter(n => filters.status!.includes(n.status));
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content?.toLowerCase().includes(query)
      );
    }
    
    if (filters.dateRange) {
      filtered = filtered.filter(n => 
        n.timestamp >= filters.dateRange!.start &&
        n.timestamp <= filters.dateRange!.end
      );
    }

    return filtered.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return bTime - aTime;
    });
  }, [notifications, filters]);

  const stats = useMemo((): NotificationStats => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>);
    
    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<NotificationPriority, number>);

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      bookmarked: notifications.filter(n => n.isBookmarked).length,
      archived: notifications.filter(n => n.isArchived).length,
      byType,
      byPriority,
      recentCount: notifications.filter(n => {
        const timestamp = n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp);
        return timestamp > yesterday;
      }).length,
    };
  }, [notifications]);

  // Persist to localStorage when notifications change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.notifications, notifications);
  }, [notifications]);

  // Core Actions
  const markAsRead = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true, status: 'read' as NotificationStatus } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsUnread = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: false, status: 'unread' as NotificationStatus } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as unread');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        isRead: true, 
        status: 'read' as NotificationStatus 
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bookmark = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isBookmarked: true, status: 'bookmarked' as NotificationStatus } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bookmark');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unbookmark = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { 
          ...n, 
          isBookmarked: false, 
          status: n.isRead ? 'read' as NotificationStatus : 'unread' as NotificationStatus 
        } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unbookmark');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const archive = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isArchived: true, status: 'archived' as NotificationStatus } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unarchive = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { 
          ...n, 
          isArchived: false, 
          status: n.isRead ? 'read' as NotificationStatus : 'unread' as NotificationStatus 
        } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unarchive');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addNotification = useCallback(async (notificationData: Omit<BaseNotification, 'id' | 'timestamp' | 'isRead' | 'isBookmarked' | 'isArchived'>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newNotification: BaseNotification = {
        ...notificationData,
        id: Date.now().toString(),
        timestamp: new Date(),
        isRead: false,
        isBookmarked: false,
        isArchived: false,
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add notification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove notification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNotification = useCallback(async (id: string, updates: Partial<BaseNotification>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, ...updates } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Bulk Actions
  const bulkMarkAsRead = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => prev.map(n => 
        ids.includes(n.id) ? { ...n, isRead: true, status: 'read' as NotificationStatus } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk mark as read');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkArchive = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => prev.map(n => 
        ids.includes(n.id) ? { ...n, isArchived: true, status: 'archived' as NotificationStatus } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk archive');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkDelete = useCallback(async (ids: string[]) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk delete');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, fetch from API
      console.log('Notifications refreshed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribeToNotifications = useCallback(() => {
    // In real app, setup WebSocket or SSE connection
    console.log('Subscribed to real-time notifications');
  }, []);

  const unsubscribeFromNotifications = useCallback(() => {
    // In real app, cleanup WebSocket or SSE connection
    console.log('Unsubscribed from real-time notifications');
  }, []);

  // UI Actions
  const toggleSelection = useCallback((id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNotifications([]);
  }, []);

  const showMoreActions = useCallback((id: string) => {
    setShowMoreMenu(showMoreMenu === id ? null : id);
  }, [showMoreMenu]);

  const hideMoreActions = useCallback(() => {
    setShowMoreMenu(null);
  }, []);

  // Actions object
  const actions: NotificationActions = useMemo(() => ({
    markAsRead,
    markAsUnread,
    markAllAsRead,
    bookmark,
    unbookmark,
    archive,
    unarchive,
    addNotification,
    removeNotification,
    updateNotification,
    bulkMarkAsRead,
    bulkArchive,
    bulkDelete,
    refreshNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  }), [
    markAsRead,
    markAsUnread,
    markAllAsRead,
    bookmark,
    unbookmark,
    archive,
    unarchive,
    addNotification,
    removeNotification,
    updateNotification,
    bulkMarkAsRead,
    bulkArchive,
    bulkDelete,
    refreshNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  ]);

  // Context Value - Memoized to Prevent Unnecessary Re-renders
  const contextValue = useMemo(() => ({
    // Data
    notifications,
    filteredNotifications,
    
    // State
    isLoading,
    error,
    filters,
    
    // Actions
    actions,
    
    // Computed
    stats,
    
    // UI State
    selectedNotifications,
    showMoreMenu,
    
    // UI Actions
    setFilters,
    setSelectedNotifications,
    toggleSelection,
    clearSelection,
    showMoreActions,
    hideMoreActions,
  }), [
    notifications,
    filteredNotifications,
    isLoading,
    error,
    filters,
    actions,
    stats,
    selectedNotifications,
    showMoreMenu,
    toggleSelection,
    clearSelection,
    showMoreActions,
    hideMoreActions,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom Hook - Professional Implementation
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Specialized hooks for specific use cases
export const useInboxNotifications = () => {
  const { filteredNotifications, actions, isLoading, stats } = useNotifications();
  
  return {
    notifications: filteredNotifications.filter(n => !n.isArchived),
    actions,
    isLoading,
    stats,
  };
};

export const useHeaderNotifications = () => {
  const { notifications, actions, stats } = useNotifications();
  
  // Only show recent unread notifications in header
  const headerNotifications = notifications
    .filter(n => !n.isRead && !n.isArchived)
    .slice(0, 5);
  
  return {
    notifications: headerNotifications,
    unreadCount: stats.unread,
    actions: {
      markAsRead: actions.markAsRead,
      markAllAsRead: actions.markAllAsRead,
      refreshNotifications: actions.refreshNotifications,
    },
  };
};

export const useBookmarkedNotifications = () => {
  const { notifications, actions, isLoading } = useNotifications();
  
  return {
    notifications: notifications.filter(n => n.isBookmarked && !n.isArchived),
    actions,
    isLoading,
  };
};

export const useArchivedNotifications = () => {
  const { notifications, actions, isLoading } = useNotifications();
  
  return {
    notifications: notifications.filter(n => n.isArchived),
    actions,
    isLoading,
  };
};

// Export types for external use
export type { NotificationContextType };