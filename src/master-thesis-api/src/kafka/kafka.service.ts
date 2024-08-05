import { Inject, Injectable } from '@nestjs/common';
import { SocketEventName } from 'src/common/ws';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class KafkaService {
  constructor(
    @Inject(SocketService) private readonly socketService: SocketService,
  ) {}

  handleTestMessage(payload: any) {
    console.log('Received message value:', payload);
    this.socketService.emit(
      SocketEventName.KAFKA_CHECK,
      {
        data: 'Test',
        message: 'Test',
        status: true,
      },
      payload.sub,
    );
  }
}
