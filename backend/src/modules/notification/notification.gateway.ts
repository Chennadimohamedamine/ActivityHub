import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { Notification } from './entities/notification.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';
import * as cookie from 'cookie';

@WebSocketGateway(3002, {
  namespace: '/notifications',
  path: '/notifications/socket.io',  // add this
  cors: { origin: true, credentials: true },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly jwtService: JwtService) { }

  afterInit(server: Server): void {
    this.logger.log(
      'Notification WebSocket Gateway initialised on port 3002 — namespace /notifications',
    );
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  handleConnection(client: Socket): void {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie || '');
      const token = cookies['access_token'];

      if (!token) {
        this.logger.warn(`Missing token for client ${client.id}`);
        client.emit('error', { message: 'Authentication token missing' });
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = payload;

      const room = `notifications`;
      client.join(room);

      this.logger.log(
        `Client connected: ${client.id} (userId: ${payload.sub})`,
      );
    } catch (err) {
      this.logger.warn(
        `Rejected connection ${client.id}: ${(err as Error).message}`,
      );

      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect(true);
    }
  }


  handleDisconnect(client: Socket): void {
    this.logger.log(
      `Client disconnected: ${client.id} (userId: ${client.data.user?.sub ?? 'unknown'})`,
    );
  }

  // ─── Events ──────────────────────────────────────────────────────────────

  /**
   * Client sends { userId } to join their personal notification room.
   * We validate that the userId matches the authenticated JWT subject.
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ): void {
    const authenticatedUserId: string = client.data.user?.sub;

    if (!data?.userId || data.userId !== authenticatedUserId) {
      throw new WsException(
        'Unauthorized: userId does not match authenticated user',
      );
    }

    const room = this.userRoom(data.userId);
    client.join(room);

    this.logger.log(`Socket ${client.id} joined room "${room}"`);

    client.emit('registered', {
      message: `Successfully joined notification room`,
      room,
    });
  }

  // ─── Public API (called by NotificationService) ──────────────────────────

  /**
   * Emit a real-time notification to the recipient's private room.
   */
  sendNotificationToUser(notification: Notification): void {
    const room = 'notifications';
    const payload = new NotificationResponseDto(notification);

    this.server.to(room).emit('notification', payload);
    this.logger.debug(
      `Emitted notification ${notification.id} to room "${room}"`,
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}