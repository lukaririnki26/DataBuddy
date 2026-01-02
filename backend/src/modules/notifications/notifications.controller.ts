/**
 * Notifications Controller
 *
 * Controller untuk API notifikasi yang menangani:
 * - Mengambil notifikasi user
 * - Menandai notifikasi sebagai sudah dibaca
 * - Menghapus notifikasi
 * - Statistik notifikasi
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import {
  NotificationsService,
  CreateNotificationDto,
  NotificationFilter,
} from "./notifications.service";
import {
  NotificationType,
  NotificationPriority,
} from "../../entities/notification.entity";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: "Get user notifications",
    description:
      "Mengambil daftar notifikasi untuk user yang sedang login dengan filter dan pagination",
  })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
    schema: {
      type: "object",
      properties: {
        notifications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              title: { type: "string" },
              message: { type: "string" },
              priority: { type: "string" },
              isRead: { type: "boolean" },
              createdAt: { type: "string" },
              metadata: { type: "object" },
            },
          },
        },
        total: { type: "number" },
        unread: { type: "number" },
      },
    },
  })
  async getNotifications(
    @Request() req,
    @Query("type") type?: string,
    @Query("isRead") isRead?: string,
    @Query("priority") priority?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const filter: NotificationFilter = {
      userId: req.user.id,
      type: type as any,
      isRead: isRead ? isRead === "true" : undefined,
      priority: priority as any,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };

    return this.notificationsService.getNotifications(filter);
  }

  @Get("stats")
  @ApiOperation({
    summary: "Get notification statistics",
    description: "Mengambil statistik notifikasi untuk dashboard",
  })
  @ApiResponse({
    status: 200,
    description: "Notification statistics retrieved successfully",
  })
  async getNotificationStats(@Request() req) {
    // Temporarily return dummy data
    return {
      total: 0,
      unread: 0,
      byType: {},
      byPriority: {},
    };
  }

  @Post(":id/read")
  @ApiOperation({
    summary: "Mark notification as read",
    description: "Menandai notifikasi tertentu sebagai sudah dibaca",
  })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
  })
  async markAsRead(@Param("id") notificationId: string, @Request() req) {
    await this.notificationsService.markAsRead(notificationId, req.user.id);
    return { message: "Notification marked as read" };
  }

  @Post("mark-all-read")
  @ApiOperation({
    summary: "Mark all notifications as read",
    description: "Menandai semua notifikasi user sebagai sudah dibaca",
  })
  @ApiResponse({
    status: 200,
    description: "All notifications marked as read",
  })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: "All notifications marked as read" };
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete notification",
    description: "Menghapus notifikasi tertentu",
  })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
  })
  async deleteNotification(
    @Param("id") notificationId: string,
    @Request() req,
  ) {
    // TODO: Implement delete notification
    // await this.notificationsService.deleteNotification(notificationId, req.user.id);
    return { message: "Notification deleted successfully" };
  }

  @Post("test")
  @ApiOperation({
    summary: "Create test notification (Development only)",
    description: "Membuat notifikasi test untuk development dan testing",
  })
  @ApiResponse({
    status: 201,
    description: "Test notification created",
  })
  async createTestNotification(
    @Request() req,
    @Body() body: Partial<CreateNotificationDto>,
  ) {
    const testNotification: CreateNotificationDto = {
      type: body.type || NotificationType.SYSTEM_ALERT,
      title: body.title || "Test Notification",
      message: body.message || "This is a test notification from DataBuddy",
      priority: body.priority || NotificationPriority.MEDIUM,
      userId: req.user.id,
      metadata: {
        test: true,
        createdBy: "test_endpoint",
        ...body.metadata,
      },
    };

    const notification =
      await this.notificationsService.createNotification(testNotification);
    return {
      message: "Test notification created",
      notification,
    };
  }
}
