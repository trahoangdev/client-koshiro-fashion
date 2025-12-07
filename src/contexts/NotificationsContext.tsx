import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Notification } from '@/lib/api';
import { useAuth } from './useAuth';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => void;
  createNotification: (data: {
    userId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
  }) => Promise<void>;
  updateNotification: (id: string, data: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
    read?: boolean;
  }) => Promise<void>;
  bulkMarkAsRead: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    // Only load notifications if user is authenticated
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load notifications from API
      const response = await api.getNotifications({ 
        page: 1, 
        limit: 100 
      });

      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      // Silently fail for unauthenticated users or 401 errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('token') && !errorMessage.includes('401') && !errorMessage.includes('Unauthorized')) {
        console.error('Error loading notifications:', error);
      }
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const archiveNotification = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      // For now, we'll just mark as read since we don't have archive functionality in backend
      await api.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (!isAuthenticated) return;
    try {
      // Delete all notifications
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      if (unreadIds.length > 0) {
        await api.bulkDelete(unreadIds);
      }
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const createNotification = async (data: {
    userId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
  }) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to create notifications');
    }
    try {
      const response = await api.createNotification(data);
      setNotifications(prev => [response.data, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const updateNotification = async (id: string, data: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
    read?: boolean;
  }) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to update notifications');
    }
    try {
      const response = await api.updateNotification(id, data);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id ? response.data : notification
        )
      );
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  };

  const bulkMarkAsRead = async (ids: string[]) => {
    if (!isAuthenticated) return;
    try {
      await api.bulkMarkAsRead(ids);
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification._id) 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error('Error bulk marking notifications as read:', error);
    }
  };

  const bulkDelete = async (ids: string[]) => {
    if (!isAuthenticated) return;
    try {
      await api.bulkDelete(ids);
      setNotifications(prev => prev.filter(notification => !ids.includes(notification._id)));
      setUnreadCount(prev => Math.max(0, prev - ids.filter(id => 
        notifications.find(n => n._id === id && !n.read)
      ).length));
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  // Load notifications when authentication status changes
  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Set up real-time updates every 30 seconds (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,
    refreshNotifications,
    createNotification,
    updateNotification,
    bulkMarkAsRead,
    bulkDelete
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
