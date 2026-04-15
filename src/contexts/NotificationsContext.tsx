import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, Notification } from '@/lib/api';
import { useAuth } from '@/contexts';
import { isAdminUser } from './authHelpers';
import { logger } from '@/lib/logger';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  createNotification: (notification: Partial<Notification>) => Promise<void>;
  updateNotification: (id: string, notification: Partial<Notification>) => Promise<void>;
  bulkMarkAsRead: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}

type CreateNotificationPayload = Parameters<typeof api.createNotification>[0];

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isAdmin = isAdminUser(user);

  const loadNotifications = useCallback(async () => {
    // Only load notifications for admin users
    if (!isAuthenticated || !isAdmin) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Loading notifications for admin user');
      
      const response = await api.getNotifications({
        page: 1,
        limit: 100,
        unreadOnly: false,
      });

      // Handle different response formats
      const notificationsData = response.data || [];
      const unreadCountData = response.unreadCount || 0;

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      
      logger.debug('Notifications loaded', { count: notificationsData.length, unreadCount: unreadCountData });
    } catch (err: unknown) {
      // Only log errors that are not "Admin access required" for non-admin users
      if (err instanceof Error && err.message === 'Admin access required') {
        logger.debug('Admin access required for notifications - user is not admin');
      } else {
        logger.error('Error loading notifications', err);
      }
      
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  const markAsRead = useCallback(async (id: string) => {
    if (!isAdmin) return;

    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      logger.debug('Notification marked as read', { id });
    } catch (err: unknown) {
      logger.error('Error marking notification as read', err);
      throw err;
    }
  }, [isAdmin]);

  const markAllAsRead = useCallback(async () => {
    if (!isAdmin) return;

    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      logger.debug('All notifications marked as read');
    } catch (err: unknown) {
      logger.error('Error marking all notifications as read', err);
      throw err;
    }
  }, [isAdmin]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!isAdmin) return;

    try {
      await api.deleteNotification(id);
      setNotifications(prev => {
        const deleted = prev.find(n => n._id === id);
        if (deleted && !deleted.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n._id !== id);
      });
      logger.debug('Notification deleted', { id });
    } catch (err: unknown) {
      logger.error('Error deleting notification', err);
      throw err;
    }
  }, [isAdmin]);

  const clearAll = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Delete all notifications
      const notificationIds = notifications.map(n => n._id);
      if (notificationIds.length > 0) {
        await api.bulkDeleteNotifications(notificationIds);
      }
      setNotifications([]);
      setUnreadCount(0);
      logger.debug('All notifications cleared');
    } catch (err: unknown) {
      logger.error('Error clearing all notifications', err);
      throw err;
    }
  }, [isAdmin, notifications]);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  const createNotification = useCallback(async (notificationData: Partial<Notification>) => {
    if (!isAdmin) return;

    try {
      if (!notificationData.title || !notificationData.message || !notificationData.type || !notificationData.category) {
        throw new Error('title, message, type and category are required to create a notification');
      }

      const payload: CreateNotificationPayload = {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        category: notificationData.category,
        userId: notificationData.userId,
        actionUrl: notificationData.actionUrl,
        expiresAt: notificationData.expiresAt
      };

      await api.createNotification(payload);
      await refreshNotifications();
      logger.debug('Notification created');
    } catch (err: unknown) {
      logger.error('Error creating notification', err);
      throw err;
    }
  }, [isAdmin, refreshNotifications]);

  const updateNotification = useCallback(async (id: string, notificationData: Partial<Notification>) => {
    if (!isAdmin) return;

    try {
      await api.updateNotification(id, notificationData);
      await refreshNotifications();
      logger.debug('Notification updated', { id });
    } catch (err: unknown) {
      logger.error('Error updating notification', err);
      throw err;
    }
  }, [isAdmin, refreshNotifications]);

  const bulkMarkAsRead = useCallback(async (ids: string[]) => {
    if (!isAdmin) return;

    try {
      await api.bulkMarkAsRead(ids);
      setNotifications(prev => 
        prev.map(n => ids.includes(n._id) ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
      logger.debug('Bulk marked notifications as read', { count: ids.length });
    } catch (err: unknown) {
      logger.error('Error bulk marking notifications as read', err);
      throw err;
    }
  }, [isAdmin]);

  const bulkDelete = useCallback(async (ids: string[]) => {
    if (!isAdmin) return;

    try {
      await api.bulkDelete(ids);
      setNotifications(prev => {
        const deleted = prev.filter(n => ids.includes(n._id));
        const unreadDeleted = deleted.filter(n => !n.read).length;
        if (unreadDeleted > 0) {
          setUnreadCount(count => Math.max(0, count - unreadDeleted));
        }
        return prev.filter(n => !ids.includes(n._id));
      });
      logger.debug('Bulk deleted notifications', { count: ids.length });
    } catch (err: unknown) {
      logger.error('Error bulk deleting notifications', err);
      throw err;
    }
  }, [isAdmin]);

  // Load notifications on mount and when auth status changes
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, loadNotifications]);

  // Refresh notifications every 30 seconds (only for admin users)
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, isAdmin, loadNotifications]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications,
    createNotification,
    updateNotification,
    bulkMarkAsRead,
    bulkDelete,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

