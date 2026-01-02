/**
 * Notifications Hooks
 *
 * Custom hooks untuk mengelola notifikasi real-time.
 * Menangani fetching, mark as read, dan WebSocket updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationsService, NotificationItem, NotificationStats, NotificationFilter } from '../services/notifications.service';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

/**
 * Hook untuk mendapatkan daftar notifikasi user
 */
export const useNotifications = (filter?: NotificationFilter) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { socket } = useSocket();
  const { toast } = useToast();

  // Memoize filter components to prevent dependency loop
  const limit = filter?.limit;
  const offset = filter?.offset;
  const type = filter?.type;
  const isRead = filter?.isRead;
  const priority = filter?.priority;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeFilter = { limit, offset, type, isRead, priority };
      const response = await notificationsService.getNotifications(activeFilter);
      setNotifications(response.notifications);
      setTotal(response.total);
      setUnread(response.unread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [limit, offset, type, isRead, priority]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      // Refresh current list when new notification arrives
      fetchNotifications();

      // Show toast if data has content
      if (data.title && data.message) {
        toast(data.type || 'info', data.title, data.message);
      }
    };

    const handleStatsUpdate = () => {
      fetchNotifications();
    };

    socket.on('notification', handleNewNotification);
    socket.on('notification:stats', handleStatsUpdate);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('notification:stats', handleStatsUpdate);
    };
  }, [socket, fetchNotifications, toast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  return {
    notifications,
    total,
    unread,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

/**
 * Hook untuk mendapatkan statistik notifikasi
 */
export const useNotificationStats = () => {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const notificationStats = await notificationsService.getNotificationStats();
      setStats(notificationStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Listen for real-time stats update
  useEffect(() => {
    if (!socket) return;

    const handleStatsUpdate = (data: any) => {
      if (data.unread !== undefined) {
        setStats(prev => prev ? { ...prev, unread: data.unread, total: data.total || prev.total } : null);
      } else {
        fetchStats();
      }
    };

    socket.on('notification:stats', handleStatsUpdate);

    return () => {
      socket.off('notification:stats', handleStatsUpdate);
    };
  }, [socket, fetchStats]);

  return {
    stats,
    unread: stats?.unread || 0,
    loading,
    error,
    refetch: fetchStats,
  };
};

/**
 * Hook untuk mengecek koneksi WebSocket
 */
export const useRealtimeNotifications = () => {
  const { connected, socket } = useSocket();
  return { connected, socket };
};
