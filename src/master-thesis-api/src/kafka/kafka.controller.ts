import { Controller, Inject, Logger } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { EventPattern, Payload, Transport } from '@nestjs/microservices';
import { KafkaEventName } from 'src/common/kafka';

@Controller()
export class KafkaController {
  constructor(
    @Inject(KafkaService) private readonly kafkaService: KafkaService,
  ) {}

  @EventPattern(KafkaEventName.KAFKA_CHECK, Transport.KAFKA)
  checkKafka(@Payload() payload: any) {
    this.kafkaService.handleTestMessage(payload);
  }

  @EventPattern('mesh.calculated', Transport.KAFKA)
  handleMeshCalculated(@Payload() payload: any) {
    Logger.log('Mesh calculated', payload);
  }
}
