import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = this.jwtService.verify(token);
      // Attach the decoded user to the socket data for downstream use
      client.data.user = payload;
      return true;
    } catch (err) {
      this.logger.warn(`Invalid WS token: ${(err as Error).message}`);
      throw new WsException('Invalid or expired token');
    }
  }

  private extractToken(client: Socket): string | null {
    // 1. Authorization header (Bearer <token>)
    const authHeader =
      client.handshake.headers['authorization'] as string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // 2. Query parameter ?token=<token>
    const queryToken = client.handshake.query['token'];
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    // 3. Auth object passed via socket.io handshake auth
    const authToken = client.handshake.auth?.['token'];
    if (authToken && typeof authToken === 'string') {
      return authToken;
    }

    return null;
  }
}