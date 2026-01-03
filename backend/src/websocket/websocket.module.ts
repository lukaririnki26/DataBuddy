import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DataBuddyWebSocketGateway } from "./websocket.gateway";

/**
 * WebSocket Module - Handles real-time communication
 *
 * Provides real-time updates for:
 * - Import progress and status
 * - Pipeline execution progress
 * - Queue statistics
 * - System notifications
 */
@Module({
  imports: [],
  providers: [DataBuddyWebSocketGateway],
  exports: [DataBuddyWebSocketGateway],
})
export class WebSocketModule { }
