/**
 * Notification Entity
 *
 * Represents system notifications for users about import/export status,
 * pipeline executions, errors, and other system events.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { IsString, IsEnum, IsOptional, IsUUID } from "class-validator";
import { User } from "./user.entity";

export enum NotificationType {
  IMPORT_COMPLETED = "import_completed",
  IMPORT_FAILED = "import_failed",
  EXPORT_COMPLETED = "export_completed",
  EXPORT_FAILED = "export_failed",
  PIPELINE_STARTED = "pipeline_started",
  PIPELINE_COMPLETED = "pipeline_completed",
  PIPELINE_FAILED = "pipeline_failed",
  DATA_IMPORT_STARTED = "data_import_started",
  DATA_EXPORT_STARTED = "data_export_started",
  SYSTEM_ERROR = "system_error",
  SYSTEM_MAINTENANCE = "system_maintenance",
  SYSTEM_ALERT = "system_alert",
  USER_INVITATION = "user_invitation",
  DATA_VALIDATION_ERROR = "data_validation_error",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NotificationStatus {
  UNREAD = "unread",
  READ = "read",
  ARCHIVED = "archived",
}

@Entity("notifications")
@Index(["user", "status"])
@Index(["type", "createdAt"])
@Index(["priority", "status"])
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 200 })
  @IsString()
  title: string;

  @Column({ type: "text" })
  @IsString()
  message: string;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @Column({
    type: "enum",
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>; // Additional data related to the notification

  @Column({ type: "varchar", length: 500, nullable: true })
  @IsOptional()
  @IsString()
  actionUrl?: string; // URL to redirect user for action

  @Column({ type: "boolean", default: false })
  emailSent: boolean; // Whether email notification was sent

  @Column({ type: "timestamp", nullable: true })
  emailSentAt?: Date;

  @Column({ type: "boolean", default: false })
  pushSent: boolean; // Whether push notification was sent

  @Column({ type: "timestamp", nullable: true })
  pushSentAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  @IsOptional()
  expiresAt?: Date; // When the notification expires

  @Column({ type: "timestamp", nullable: true })
  readAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  archivedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "uuid" })
  @IsUUID()
  userId: string;

  // Virtual properties
  get isUnread(): boolean {
    return this.status === NotificationStatus.UNREAD;
  }

  get isRead(): boolean {
    return this.status === NotificationStatus.READ;
  }

  get isArchived(): boolean {
    return this.status === NotificationStatus.ARCHIVED;
  }

  get isHighPriority(): boolean {
    return [NotificationPriority.HIGH, NotificationPriority.URGENT].includes(
      this.priority,
    );
  }

  get isUrgent(): boolean {
    return this.priority === NotificationPriority.URGENT;
  }

  // Methods
  markAsRead() {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
  }

  markAsUnread() {
    this.status = NotificationStatus.UNREAD;
    this.readAt = null;
  }

  archive() {
    this.status = NotificationStatus.ARCHIVED;
    this.archivedAt = new Date();
  }

  markEmailSent() {
    this.emailSent = true;
    this.emailSentAt = new Date();
  }

  markPushSent() {
    this.pushSent = true;
    this.pushSentAt = new Date();
  }

  // Create notification from import event
  static fromImport(importEntity: any, user: User): Partial<Notification> {
    const isCompleted = importEntity.status === "completed";
    const isFailed = importEntity.status === "failed";

    let type: NotificationType;
    let title: string;
    let message: string;
    let priority: NotificationPriority;

    if (isCompleted) {
      type = NotificationType.IMPORT_COMPLETED;
      title = `Import Completed: ${importEntity.name}`;
      message = `Your data import "${importEntity.name}" has been completed successfully. ${importEntity.processedRows} rows were processed.`;
      priority = NotificationPriority.MEDIUM;
    } else if (isFailed) {
      type = NotificationType.IMPORT_FAILED;
      title = `Import Failed: ${importEntity.name}`;
      message = `Your data import "${importEntity.name}" has failed. ${importEntity.errorRows} rows had errors.`;
      priority = NotificationPriority.HIGH;
    } else {
      throw new Error("Invalid import status for notification");
    }

    return {
      title,
      message,
      type,
      priority,
      metadata: {
        importId: importEntity.id,
        totalRows: importEntity.totalRows,
        processedRows: importEntity.processedRows,
        errorRows: importEntity.errorRows,
        durationSeconds: importEntity.durationSeconds,
      },
      actionUrl: `/imports/${importEntity.id}`,
      userId: user.id,
    };
  }

  // Create notification from export event
  static fromExport(exportEntity: any, user: User): Partial<Notification> {
    const isCompleted = exportEntity.status === "completed";
    const isFailed = exportEntity.status === "failed";

    let type: NotificationType;
    let title: string;
    let message: string;
    let priority: NotificationPriority;

    if (isCompleted) {
      type = NotificationType.EXPORT_COMPLETED;
      title = `Export Completed: ${exportEntity.name}`;
      message = `Your data export "${exportEntity.name}" has been completed successfully. ${exportEntity.processedRows} rows were exported.`;
      priority = NotificationPriority.MEDIUM;
    } else if (isFailed) {
      type = NotificationType.EXPORT_FAILED;
      title = `Export Failed: ${exportEntity.name}`;
      message = `Your data export "${exportEntity.name}" has failed. ${exportEntity.errorRows} rows had errors.`;
      priority = NotificationPriority.HIGH;
    } else {
      throw new Error("Invalid export status for notification");
    }

    return {
      title,
      message,
      type,
      priority,
      metadata: {
        exportId: exportEntity.id,
        totalRows: exportEntity.totalRows,
        processedRows: exportEntity.processedRows,
        errorRows: exportEntity.errorRows,
        durationSeconds: exportEntity.durationSeconds,
        downloadUrl: exportEntity.downloadUrl,
      },
      actionUrl: `/exports/${exportEntity.id}`,
      userId: user.id,
    };
  }

  // Create notification from pipeline event
  static fromPipeline(
    pipeline: any,
    executionTime?: number,
    error?: string,
  ): Partial<Notification> {
    const hasError = !!error;

    let type: NotificationType;
    let title: string;
    let message: string;
    let priority: NotificationPriority;

    if (hasError) {
      type = NotificationType.PIPELINE_FAILED;
      title = `Pipeline Failed: ${pipeline.name}`;
      message = `Pipeline execution "${pipeline.name}" has failed: ${error}`;
      priority = NotificationPriority.HIGH;
    } else {
      type = NotificationType.PIPELINE_COMPLETED;
      title = `Pipeline Executed: ${pipeline.name}`;
      message = `Pipeline "${pipeline.name}" has been executed successfully${executionTime ? ` in ${executionTime.toFixed(2)} seconds` : ""}.`;
      priority = NotificationPriority.LOW;
    }

    return {
      title,
      message,
      type,
      priority,
      metadata: {
        pipelineId: pipeline.id,
        executionTime,
        error,
        executedAt: new Date(),
      },
      actionUrl: `/pipelines/${pipeline.id}`,
      userId: pipeline.createdById,
    };
  }

  // Create system notification
  static systemNotification(
    user: User,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM_ERROR,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    metadata?: Record<string, any>,
  ): Partial<Notification> {
    return {
      title,
      message,
      type,
      priority,
      metadata,
      userId: user.id,
    };
  }
}
