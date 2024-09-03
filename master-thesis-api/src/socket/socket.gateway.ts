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
import { TokenDTO } from 'src/auth0/dto/token.dto';

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
    const token = client.handshake.headers.authorization
      ? client.handshake.headers.authorization.split(' ')[1]
      : client.handshake.auth.token.split(' ')[1];

    if (!token) {
      return { authorized: false, sub: null };
    }

    const decode: TokenDTO = this.jwtService.decode(token);

    if (!this.verifyToken(decode)) {
      return { authorized: false, sub: null };
    }

    return { authorized: true, sub: decode.sub };
  }

  private verifyToken(token: TokenDTO) {
    let result = true;
    if (!token) result = false;

    if (!token.iss || token.iss !== process.env.AUTH0_ISSUER_URL) {
      Logger.error('Token issuer is not valid');
      result = false;
    }

    if (!token.aud || !token.aud.includes(process.env.AUTH0_AUDIENCE)) {
      Logger.error('Token audience is not valid');
      result = false;
    }

    return result;
  }
}
