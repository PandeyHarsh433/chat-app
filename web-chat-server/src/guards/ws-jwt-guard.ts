import { Socket } from 'socket.io';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();

      const token = this.extractToken(client);

      if (!token) {
        console.log('No token found');
        throw new WsException('Authentication token not found');
      }

      client.data.user = this.jwtService.verify(token);

      return true;
    } catch (err) {
      console.error('Error during token verification:', err);
      throw new WsException('Invalid authentication token');
    }
  }

  private extractToken(client: Socket): string | undefined {
    const auth =
      client.handshake.auth.token || client.handshake.headers['authorization'];
    if (auth) {
      return auth.replace('Bearer ', '');
    }
    return undefined;
  }
}
