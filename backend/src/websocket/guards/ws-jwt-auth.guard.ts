import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

/**
 * WebSocket JWT Authentication Guard
 *
 * Validates JWT tokens for WebSocket connections and messages
 */
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();

    // Extract token from handshake auth or query params
    const token = client.handshake.auth?.token || client.handshake.query?.token as string;

    if (!token) {
      return false;
    }

    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(token);

      // Attach user info to socket for later use
      (client as any).user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch (error) {
      return false;
    }
  }
}
