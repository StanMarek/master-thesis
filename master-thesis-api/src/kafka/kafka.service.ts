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

  handleMeshCalculated(payload: any) {
    this.socketService.emit(
      SocketEventName.CALCULATE_MESH_END,
      {
        status: true,
        message: 'Mesh calculated successfully',
        data: null,
      },
      payload,
    );
  }
}
