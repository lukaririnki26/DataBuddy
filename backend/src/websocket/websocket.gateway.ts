import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsJwtAuthGuard } from "./guards/ws-jwt-auth.guard";

/**
 * WebSocket Gateway for real-time updates
 *
 * Events:
 * - import:progress - Import job progress updates
 * - import:completed - Import job completion
 * - pipeline:progress - Pipeline execution progress
 * - pipeline:completed - Pipeline execution completion
 * - queue:stats - Queue statistics updates
 * - notification - General system notifications
 */
@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ].filter(Boolean) as string[],
    credentials: true,
  },
  namespace: "/",
})
@Injectable()
export class DataBuddyWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedClients = new Map<
    string,
    { userId: string; rooms: string[] }
  >();

  constructor(private readonly jwtService: JwtService) { }

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      let token =
        client.handshake.auth.token || (client.handshake.query.token as string);

      if (!token) {
        this.logger.warn(`Client ${client.id} tried to connect without token`);
        client.disconnect();
        return;
      }

      // Clean token if it has Bearer prefix
      if (typeof token === 'string' && token.startsWith("Bearer ")) {
        token = token.substring(7).trim();
      }

      this.logger.debug(`Verifying token for client ${client.id} (Length: ${token.length})`);

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store client connection info
      this.connectedClients.set(client.id, {
        userId,
        rooms: [],
      });

      // Join user-specific room
      client.join(`user_${userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);

      // Send welcome message
      client.emit("connected", {
        message: "Successfully connected to DataBuddy WebSocket",
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`WebSocket connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(
        `Client disconnected: ${client.id} (User: ${clientInfo.userId})`,
      );
      this.connectedClients.delete(client.id);
    }
  }

  /**
   * Subscribe to specific rooms/channels
   */
  @SubscribeMessage("subscribe")
  @UseGuards(WsJwtAuthGuard)
  handleSubscribe(
    @MessageBody() data: { rooms: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo)
      return { success: false, message: "Client not authenticated" };

    const { rooms } = data;

    // Leave existing rooms
    clientInfo.rooms.forEach((room) => client.leave(room));

    // Join new rooms
    rooms.forEach((room) => {
      client.join(room);
      this.logger.debug(`Client ${client.id} joined room: ${room}`);
    });

    clientInfo.rooms = rooms;

    return {
      success: true,
      message: `Subscribed to rooms: ${rooms.join(", ")}`,
      rooms,
    };
  }

  /**
   * Unsubscribe from rooms
   */
  @SubscribeMessage("unsubscribe")
  @UseGuards(WsJwtAuthGuard)
  handleUnsubscribe(
    @MessageBody() data: { rooms: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo)
      return { success: false, message: "Client not authenticated" };

    const { rooms } = data;

    rooms.forEach((room) => {
      client.leave(room);
      this.logger.debug(`Client ${client.id} left room: ${room}`);
    });

    clientInfo.rooms = clientInfo.rooms.filter((room) => !rooms.includes(room));

    return {
      success: true,
      message: `Unsubscribed from rooms: ${rooms.join(", ")}`,
      rooms: clientInfo.rooms,
    };
  }

  /**
   * Send import progress update
   */
  emitImportProgress(
    importId: string,
    userId: string,
    progress: {
      status: string;
      progress?: number;
      processedRows?: number;
      totalRows?: number;
      errors?: string[];
      currentStep?: string;
    },
  ) {
    const event = "import:progress";
    const data = {
      importId,
      ...progress,
      timestamp: new Date().toISOString(),
    };

    // Send to user-specific room
    this.server.to(`user_${userId}`).emit(event, data);

    // Send to import-specific room (for multiple users monitoring same import)
    this.server.to(`import_${importId}`).emit(event, data);

    this.logger.debug(
      `Emitted import progress: ${importId} - ${progress.status}`,
    );
  }

  /**
   * Send import completion notification
   */
  emitImportCompleted(
    importId: string,
    userId: string,
    result: {
      success: boolean;
      processedRows: number;
      totalRows: number;
      errors: string[];
      warnings: string[];
      executionTime: number;
      metadata: any;
    },
  ) {
    const event = "import:completed";
    const data = {
      importId,
      ...result,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`user_${userId}`).emit(event, data);
    this.server.to(`import_${importId}`).emit(event, data);

    this.logger.log(
      `Emitted import completion: ${importId} - ${result.success ? "SUCCESS" : "FAILED"}`,
    );
  }

  /**
   * Send pipeline execution progress
   */
  emitPipelineProgress(
    pipelineId: string,
    executionId: string,
    userId: string,
    progress: {
      status: string;
      progress?: number;
      currentStep?: string;
      processedItems?: number;
      errors?: string[];
      warnings?: string[];
    },
  ) {
    const event = "pipeline:progress";
    const data = {
      pipelineId,
      executionId,
      ...progress,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`user_${userId}`).emit(event, data);
    this.server.to(`pipeline_${pipelineId}`).emit(event, data);

    this.logger.debug(
      `Emitted pipeline progress: ${pipelineId} - ${progress.status}`,
    );
  }

  /**
   * Send pipeline execution completion
   */
  emitPipelineCompleted(
    pipelineId: string,
    executionId: string,
    userId: string,
    result: {
      success: boolean;
      processedItems: number;
      errors: string[];
      warnings: string[];
      executionTime: number;
      metadata: any;
    },
  ) {
    const event = "pipeline:completed";
    const data = {
      pipelineId,
      executionId,
      ...result,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`user_${userId}`).emit(event, data);
    this.server.to(`pipeline_${pipelineId}`).emit(event, data);

    this.logger.log(
      `Emitted pipeline completion: ${pipelineId} - ${result.success ? "SUCCESS" : "FAILED"}`,
    );
  }

  /**
   * Send queue statistics update
   */
  emitQueueStats(
    queueName: string,
    stats: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      total: number;
    },
  ) {
    const event = "queue:stats";
    const data = {
      queueName,
      ...stats,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all connected clients (admins can filter on frontend)
    this.server.emit(event, data);

    this.logger.debug(
      `Emitted queue stats: ${queueName} - ${stats.active} active, ${stats.waiting} waiting`,
    );
  }

  /**
   * Send general notification
   */
  emitNotification(
    userId: string | null,
    notification: {
      type: "info" | "success" | "warning" | "error";
      title: string;
      message: string;
      data?: any;
    },
  ) {
    const event = "notification";
    const data = {
      ...notification,
      timestamp: new Date().toISOString(),
    };

    if (userId) {
      // Send to specific user
      this.server.to(`user_${userId}`).emit(event, data);
    } else {
      // Broadcast to all users
      this.server.emit(event, data);
    }

    this.logger.log(
      `Emitted notification: ${notification.type} - ${notification.title}`,
    );
  }

  /**
   * Send notification stats update (unread count)
   */
  emitNotificationStats(
    userId: string,
    stats: {
      unread: number;
      total: number;
    },
  ) {
    const event = "notification:stats";
    const data = {
      ...stats,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`user_${userId}`).emit(event, data);

    this.logger.debug(
      `Emitted notification stats for user ${userId}: ${stats.unread} unread`,
    );
  }

  /**
   * Get connected client count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get connected clients for a specific user
   */
  getUserClients(userId: string): string[] {
    return Array.from(this.connectedClients.entries())
      .filter(([, info]) => info.userId === userId)
      .map(([clientId]) => clientId);
  }
}
