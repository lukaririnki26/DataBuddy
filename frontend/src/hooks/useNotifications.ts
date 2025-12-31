/**
 * Notifications Hooks
 *
 * Custom hooks untuk mengelola notifikasi real-time.
 * Menangani fetching, mark as read, dan WebSocket updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationsService, NotificationItem, NotificationStats, NotificationFilter } from '../services/notifications.service';

/**
 * Hook untuk mendapatkan daftar notifikasi user
 */
export const useNotifications = (filter?: NotificationFilter) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationsService.getNotifications(filter);
      setNotifications(response.notifications);
      setTotal(response.total);
      setUnread(response.unread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setNotifications([]);
      setTotal(0);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnread(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setTotal(prev => Math.max(0, prev - 1));
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

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

/**
 * Hook untuk real-time notification updates via WebSocket
 */
export const useRealtimeNotifications = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // In a real implementation, you'd connect to WebSocket here
    // For now, we'll simulate with polling
    const connectWebSocket = () => {
      try {
        // const ws = new WebSocket('ws://localhost:3001');
        // ws.onopen = () => setConnected(true);
        // ws.onclose = () => setConnected(false);
        // ws.onmessage = (event) => {
        //   const notification = JSON.parse(event.data);
        //   // Handle incoming notification
        // };
        // setSocket(ws);

        // Simulate connection
        setConnected(true);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return {
    connected,
    socket,
  };
};
