/**
 * Notifications API Service
 *
 * Service untuk berkomunikasi dengan notifications endpoints di backend.
 * Menangani fetching notifikasi, mark as read, dan statistik notifikasi.
 */

import { api } from './api';

// Types
export interface NotificationItem {
  id: string;
  type: 'PIPELINE_STARTED' | 'PIPELINE_COMPLETED' | 'PIPELINE_FAILED' |
        'DATA_IMPORT_STARTED' | 'DATA_IMPORT_COMPLETED' | 'DATA_IMPORT_FAILED' |
        'DATA_EXPORT_STARTED' | 'DATA_EXPORT_COMPLETED' | 'DATA_EXPORT_FAILED' |
        'SYSTEM_ALERT' | 'SYSTEM_MAINTENANCE';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  unread: number;
}

export interface NotificationFilter {
  type?: string;
  isRead?: boolean;
  priority?: string;
  limit?: number;
  offset?: number;
}

/**
 * Notifications Service Class
 */
export class NotificationsService {
  /**
   * Get user notifications with filtering and pagination
   */
  async getNotifications(filter?: NotificationFilter): Promise<NotificationListResponse> {
    return api.get<NotificationListResponse>(`/notifications`, filter);
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    return api.get<NotificationStats>(`/notifications/stats`);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    return api.post(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    return api.post(`/notifications/mark-all-read`);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return api.delete(`/notifications/${notificationId}`);
  }

  /**
   * Create test notification (development only)
   */
  async createTestNotification(data?: {
    type?: string;
    title?: string;
    message?: string;
    priority?: string;
  }): Promise<{ message: string; notification: NotificationItem }> {
    return api.post(`/notifications/test`, data);
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService();
