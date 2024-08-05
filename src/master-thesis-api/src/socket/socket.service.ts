import { Injectable, Logger } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

import {
  SocketEvent,
  SocketEventDataType,
  SocketEventName,
  SocketEventType,
} from 'src/common/ws';

@Injectable()
export class SocketService {
  private readonly connectedClients: Record<string, Socket[]> = {};
  private readonly clientSubMap: Record<string, string[]> = {};

  handleConnection(@ConnectedSocket() socket: Socket, sub: string): void {
    const clientId = socket.id;
    if (!this.connectedClients[clientId]) {
      this.connectedClients[clientId] = [];
    }
    if (!this.clientSubMap[sub]) {
      this.clientSubMap[sub] = [];
    }
    this.clientSubMap[sub].push(clientId);
    this.connectedClients[clientId].push(socket);

    Logger.verbose(`Client connected: ${clientId} with sub: ${sub}`);

    this.emit(
      SocketEventName.CONNECTED,
      {
        data: {
          status: 'connected',
          clientId,
        },
        message: 'Client connected',
        status: true,
      },
      sub,
    );
  }

  handleDisconnect(socket: Socket) {
    const clientId = socket.id;
    this.connectedClients[clientId] = this.connectedClients[clientId].filter(
      (s) => s !== socket,
    );
    Logger.verbose(`Client disconnected: ${clientId}`);
  }

  connectionEstablished(sub: string) {
    const clientIds = this.clientSubMap[sub];
    const sockets = [];

    clientIds.forEach((clientId) => {
      sockets.push(...this.connectedClients[clientId]);
    });

    return sockets.length > 0;
  }

  emit<E extends keyof SocketEventType>(
    event: SocketEventName,
    data: SocketEventDataType<SocketEventType[E]>,
    sub: string,
  ) {
    Logger.verbose(`Emitting event: ${event} to sub: ${sub}`);
    const clientIds = this.clientSubMap[sub];

    if (clientIds.length) {
      const sockets = [];

      clientIds.forEach((clientId) => {
        sockets.push(...this.connectedClients[clientId]);
      });

      if (sockets.length) {
        for (const socket of sockets)
          socket.emit(SocketEvent[event].eventName, data);
      }
    }
  }
}
