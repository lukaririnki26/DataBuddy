/**
 * Notifications Service
 *
 * Service untuk mengelola notifikasi real-time dan alert sistem DataBuddy.
 * Menangani berbagai jenis notifikasi seperti status pipeline, error alerts,
 * progress updates, dan pesan sistem kepada pengguna.
 */

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
} from "../../entities/notification.entity";
import { User } from "../../entities/user.entity";
import { DataBuddyWebSocketGateway } from "../../websocket/websocket.gateway";

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  userId?: string; // null untuk broadcast ke semua user
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface NotificationFilter {
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly websocketGateway: DataBuddyWebSocketGateway,
  ) { }

  /**
   * Membuat notifikasi baru dan broadcast ke WebSocket
   */
  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: dto.type,
      title: dto.title,
      message: dto.message,
      priority: dto.priority || NotificationPriority.MEDIUM,
      userId: dto.userId,
      metadata: dto.metadata || {},
      expiresAt: dto.expiresAt,
      isRead: false,
      status: NotificationStatus.UNREAD,
      createdAt: new Date(),
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    // Broadcast notifikasi ke WebSocket
    await this.broadcastNotification(savedNotification);

    this.logger.log(`Notification created: ${dto.type} - ${dto.title}`);
    return savedNotification;
  }

  /**
   * Membuat notifikasi pipeline execution
   */
  async notifyPipelineExecution(
    pipelineId: string,
    pipelineName: string,
    status: "started" | "completed" | "failed",
    userId: string,
    metadata?: any,
  ): Promise<void> {
    let title: string;
    let message: string;
    let priority: NotificationPriority;
    let type: NotificationType;

    switch (status) {
      case "started":
        title = `Pipeline Started: ${pipelineName}`;
        message = `Pipeline "${pipelineName}" has started execution.`;
        priority = NotificationPriority.LOW;
        type = NotificationType.PIPELINE_STARTED;
        break;
      case "completed":
        title = `Pipeline Completed: ${pipelineName}`;
        message = `Pipeline "${pipelineName}" has completed successfully.`;
        priority = NotificationPriority.MEDIUM;
        type = NotificationType.PIPELINE_COMPLETED;
        break;
      case "failed":
        title = `Pipeline Failed: ${pipelineName}`;
        message = `Pipeline "${pipelineName}" execution failed. Check logs for details.`;
        priority = NotificationPriority.HIGH;
        type = NotificationType.PIPELINE_FAILED;
        break;
      default:
        title = `Pipeline Alert: ${pipelineName}`;
        message = `Pipeline "${pipelineName}" status: ${status}`;
        priority = NotificationPriority.MEDIUM;
        type = NotificationType.SYSTEM_ALERT;
    }

    await this.createNotification({
      type,
      title,
      message,
      priority,
      userId,
      metadata: {
        pipelineId,
        pipelineName,
        status,
        ...metadata,
      },
    });
  }

  /**
   * Membuat notifikasi data import/export
   */
  async notifyDataOperation(
    operation: "import" | "export",
    status: "started" | "completed" | "failed",
    userId: string,
    metadata?: any,
  ): Promise<void> {
    const operationType = operation === "import" ? "Import" : "Export";
    let title: string;
    let message: string;
    let priority: NotificationPriority;
    let type: NotificationType;

    switch (status) {
      case "started":
        title = `Data ${operationType} Started`;
        message = `Data ${operation.toLowerCase()} operation has started.`;
        priority = NotificationPriority.LOW;
        type =
          operation === "import"
            ? NotificationType.DATA_IMPORT_STARTED
            : NotificationType.DATA_EXPORT_STARTED;
        break;
      case "completed":
        title = `Data ${operationType} Completed`;
        message = `Data ${operation.toLowerCase()} operation completed successfully.`;
        priority = NotificationPriority.MEDIUM;
        type =
          operation === "import"
            ? NotificationType.IMPORT_COMPLETED
            : NotificationType.EXPORT_COMPLETED;
        break;
      case "failed":
        title = `Data ${operationType} Failed`;
        message = `Data ${operation.toLowerCase()} operation failed.`;
        priority = NotificationPriority.HIGH;
        type =
          operation === "import"
            ? NotificationType.IMPORT_FAILED
            : NotificationType.EXPORT_FAILED;
        break;
      default:
        title = `Data ${operationType} Alert`;
        message = `Data ${operation.toLowerCase()} operation status: ${status}`;
        priority = NotificationPriority.MEDIUM;
        type = NotificationType.SYSTEM_ALERT;
    }

    await this.createNotification({
      type,
      title,
      message,
      priority,
      userId,
      metadata,
    });
  }

  /**
   * Membuat notifikasi sistem (broadcast ke semua user)
   */
  async notifySystemAlert(
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.HIGH,
    userId: string,
    metadata?: any,
  ): Promise<void> {
    await this.createNotification({
      type: NotificationType.SYSTEM_ALERT,
      title,
      message,
      priority,
      userId,
      metadata,
    });
  }

  /**
   * Membuat notifikasi maintenance atau update
   */
  async notifySystemMaintenance(
    title: string,
    message: string,
    scheduledTime?: Date,
    metadata?: any,
  ): Promise<void> {
    const notificationMessage = scheduledTime
      ? `${message} Scheduled for: ${scheduledTime.toISOString()}`
      : message;

    await this.createNotification({
      type: NotificationType.SYSTEM_MAINTENANCE,
      title,
      message: notificationMessage,
      priority: NotificationPriority.MEDIUM,
      metadata: {
        scheduledTime: scheduledTime?.toISOString(),
        ...metadata,
      },
    });
  }

  /**
   * Mendapatkan notifikasi untuk user tertentu dengan filter
   */
  async getNotifications(filter: NotificationFilter): Promise<{
    notifications: Notification[];
    total: number;
    unread: number;
  }> {
    const query =
      this.notificationRepository.createQueryBuilder("notification");

    // Filter berdasarkan user (jika tidak null, ambil notifikasi untuk user tersebut atau broadcast)
    if (filter.userId) {
      query.where(
        "(notification.userId = :userId OR notification.userId IS NULL)",
        {
          userId: filter.userId,
        },
      );
    }

    // Filter berdasarkan tipe
    if (filter.type) {
      query.andWhere("notification.type = :type", { type: filter.type });
    }

    // Filter berdasarkan status baca
    if (filter.isRead !== undefined) {
      const status = filter.isRead
        ? NotificationStatus.READ
        : NotificationStatus.UNREAD;
      query.andWhere("notification.status = :status", { status });
    }

    // Filter berdasarkan prioritas
    if (filter.priority) {
      query.andWhere("notification.priority = :priority", {
        priority: filter.priority,
      });
    }

    // Filter notifikasi yang belum expired
    query.andWhere(
      "(notification.expiresAt IS NULL OR notification.expiresAt > :now)",
      {
        now: new Date(),
      },
    );

    // Pagination
    const limit = filter.limit || 20;
    const offset = filter.offset || 0;

    query.orderBy("notification.createdAt", "DESC").limit(limit).offset(offset);

    const [notifications, total] = await query.getManyAndCount();

    // Hitung jumlah notifikasi yang belum dibaca
    const unreadQuery =
      this.notificationRepository.createQueryBuilder("notification");
    if (filter.userId) {
      unreadQuery.where(
        "(notification.userId = :userId OR notification.userId IS NULL)",
        {
          userId: filter.userId,
        },
      );
    }
    unreadQuery.andWhere("notification.status = :status", {
      status: NotificationStatus.UNREAD,
    });
    unreadQuery.andWhere(
      "(notification.expiresAt IS NULL OR notification.expiresAt > :now)",
      {
        now: new Date(),
      },
    );

    const unread = await unreadQuery.getCount();

    return {
      notifications,
      total,
      unread,
    };
  }

  /**
   * Menandai notifikasi sebagai sudah dibaca
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }

    // Pastikan user memiliki akses ke notifikasi ini
    if (notification.userId && notification.userId !== userId) {
      throw new Error("Access denied to this notification");
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    await this.notificationRepository.save(notification);
    this.logger.log(`Notification ${notificationId} marked as read`);

    // Broadcast update ke WebSocket
    await this.notifyUserStatsUpdate(userId);
  }

  /**
   * Menandai semua notifikasi sebagai sudah dibaca untuk user tertentu
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      {
        userId,
        status: NotificationStatus.UNREAD,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );

    this.logger.log(`All notifications marked as read for user ${userId}`);

    // Broadcast update ke WebSocket
    await this.notifyUserStatsUpdate(userId);
  }

  /**
   * Menghapus notifikasi
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }

    // Pastikan user memiliki akses ke notifikasi ini
    if (notification.userId && notification.userId !== userId) {
      throw new Error("Access denied to this notification");
    }

    await this.notificationRepository.remove(notification);
    this.logger.log(`Notification ${notificationId} deleted`);

    // Broadcast update ke WebSocket
    await this.notifyUserStatsUpdate(userId);
  }

  /**
   * Membersihkan notifikasi yang sudah expired
   */
  async cleanupExpiredNotifications(): Promise<number> {
    const now = new Date();
    const result = await this.notificationRepository.delete({
      expiresAt: LessThan(now),
    });

    this.logger.log(`Cleaned up ${result.affected || 0} expired notifications`);
    return result.affected || 0;
  }

  /**
   * Broadcast notifikasi ke WebSocket
   */
  private async broadcastNotification(
    notification: Notification,
  ): Promise<void> {
    try {
      this.websocketGateway.emitNotification(notification.userId, {
        type:
          notification.priority === NotificationPriority.HIGH
            ? "error"
            : notification.priority === NotificationPriority.MEDIUM
              ? "warning"
              : "info",
        title: notification.title,
        message: notification.message,
        data: notification,
      });

      // Juga update statistik (jumlah unread) jika ada userId
      if (notification.userId) {
        await this.notifyUserStatsUpdate(notification.userId);
      }
    } catch (error) {
      this.logger.error(
        "Failed to broadcast notification via WebSocket:",
        error,
      );
    }
  }

  /**
   * Mendapatkan statistik notifikasi untuk dashboard
   */
  async getNotificationStats(userId?: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const baseQuery =
      this.notificationRepository.createQueryBuilder("notification");

    if (userId) {
      baseQuery.where(
        "(notification.userId = :userId OR notification.userId IS NULL)",
        {
          userId,
        },
      );
    }

    // Total notifikasi
    const total = await baseQuery.getCount();

    // Notifikasi yang belum dibaca
    const unread = await baseQuery
      .clone() // Clone query to avoid affecting subsequent queries on baseQuery
      .andWhere("notification.status = :status", {
        status: NotificationStatus.UNREAD,
      })
      .getCount();

    // Statistik berdasarkan tipe
    const byTypeResult = await this.notificationRepository
      .createQueryBuilder("notification")
      .select("notification.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("notification.type")
      .getRawMany();

    const byType = byTypeResult.reduce(
      (acc, row) => {
        acc[row.type] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Statistik berdasarkan prioritas
    const byPriorityResult = await this.notificationRepository
      .createQueryBuilder("notification")
      .select("notification.priority", "priority")
      .addSelect("COUNT(*)", "count")
      .groupBy("notification.priority")
      .getRawMany();

    const byPriority = byPriorityResult.reduce(
      (acc, row) => {
        acc[row.priority] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      unread,
      byType,
      byPriority,
    };
  }

  /**
   * Mengirim statistik terbaru ke user melalui WebSocket
   */
  private async notifyUserStatsUpdate(userId: string): Promise<void> {
    try {
      const stats = await this.getNotificationStats(userId);
      this.websocketGateway.emitNotificationStats(userId, {
        unread: stats.unread,
        total: stats.total,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send notification stats update for user ${userId}:`,
        error,
      );
    }
  }
}
