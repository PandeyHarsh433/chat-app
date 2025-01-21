import { Socket } from 'socket.io';
import { JwtPayload } from './interfaces';

export interface AuthenticatedSocket extends Socket {
  user: JwtPayload;
}
