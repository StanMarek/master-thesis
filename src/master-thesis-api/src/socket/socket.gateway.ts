import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway(3001, { namespace: 'ws-events' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server = Socket;

  constructor(
    @Inject(SocketService) private readonly socketService: SocketService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  handleDisconnect(socket: Socket) {
    this.socketService.handleDisconnect(socket);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    const auth = this.authorized(client);
    if (!auth.authorized) {
      client.disconnect();
      return;
    }
    this.socketService.handleConnection(client, auth.sub);
  }

  private authorized(client: Socket) {
    const token = client.handshake.headers.authorization.split(' ')[1];

    if (!token) {
      return { authorized: false, sub: null };
    }

    const decode: {
      iss: string;
      sub: string;
      aud: string[];
      iat: number;
      exp: number;
    } = this.jwtService.decode(token);

    if (!this.verifyToken(decode)) {
      return { authorized: false, sub: null };
    }

    return { authorized: true, sub: decode.sub };
  }

  private verifyToken(token: {
    iss: string;
    sub: string;
    aud: string[];
    iat: number;
    exp: number;
  }) {
    let result = true;

    if (token.iss !== '') {
      Logger.error('Token issuer is not valid');
      result = false;
    }

    if (!token.aud.includes('')) {
      Logger.error('Token audience is not valid');
      result = false;
    }

    if (!token.aud.includes('')) {
      Logger.error('Token audience is not valid');
      result = false;
    }

    return result;
  }
}
