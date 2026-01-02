/**
 * Notifications Module
 *
 * Modul untuk sistem notifikasi real-time DataBuddy yang mencakup:
 * - Manajemen notifikasi untuk setiap user
 * - Broadcast notifikasi via WebSocket
 * - Alert sistem dan status updates
 * - Integration dengan pipeline executions dan data operations
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

// Import entities
import { Notification } from "../../entities/notification.entity";
import { User } from "../../entities/user.entity";

// Import WebSocket gateway untuk real-time notifications
import { WebSocketModule } from "../../websocket/websocket.module";

@Module({
  imports: [
    // Register entities untuk akses database
    TypeOrmModule.forFeature([Notification, User]),

    // Import WebSocket module untuk real-time broadcasting
    WebSocketModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // Export service agar bisa digunakan di module lain
})
export class NotificationsModule {}
