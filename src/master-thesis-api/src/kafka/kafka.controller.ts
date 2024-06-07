import { Controller, Inject } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { EventPattern, Payload, Transport } from '@nestjs/microservices';

@Controller()
export class KafkaController {
  constructor(
    @Inject(KafkaService) private readonly kafkaService: KafkaService,
  ) {}

  @EventPattern('kafka.check', Transport.KAFKA)
  checkKafka(@Payload() payload: any) {
    this.kafkaService.handleTestMessage(payload);
  }
}
