import { Inject, Injectable } from '@nestjs/common';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class KafkaService {
  constructor(
    @Inject(SocketService) private readonly socketService: SocketService,
  ) {}

  handleTestMessage(payload: any) {
    console.log('Received message value:', payload);
    this.socketService.emit('kafka.check', payload, payload.sub);
  }
}
