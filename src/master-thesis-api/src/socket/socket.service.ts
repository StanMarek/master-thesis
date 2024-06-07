import { Injectable, Logger } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly clientSubMap = new Map<string, string>();

  handleConnection(@ConnectedSocket() socket: Socket, sub: string): void {
    const clientId = socket.id;
    this.clientSubMap.set(sub, clientId);
    this.connectedClients.set(clientId, socket);

    Logger.verbose(`Client connected: ${clientId} with sub: ${sub}`);

    socket.emit('client.socket.connect', {
      status: 'connected',
      clientId,
    });
  }

  handleDisconnect(socket: Socket) {
    const clientId = socket.id;
    this.connectedClients.delete(clientId);
    Logger.verbose(`Client disconnected: ${clientId}`);
  }

  connectionEstablished(sub: string) {
    const clientId = this.clientSubMap.get(sub);
    const socket = this.connectedClients.get(clientId);

    return !!socket;
  }

  emit(event: string, data: any, sub: string) {
    const clientId = this.clientSubMap.get(sub);

    if (clientId) {
      const socket = this.connectedClients.get(clientId);

      if (socket) {
        socket.emit(event, data);
      }
    }
  }
}
