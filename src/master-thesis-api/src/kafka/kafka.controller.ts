import { Controller, Inject } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { EventPattern, Payload, Transport } from '@nestjs/microservices';
import { KafkaTopic } from 'src/common/enum';

@Controller()
export class KafkaController {
  constructor(
    @Inject(KafkaService) private readonly kafkaService: KafkaService,
  ) {}

  @EventPattern(KafkaTopic.KAFKA_CHECK, Transport.KAFKA)
  checkKafka(@Payload() payload: any) {
    this.kafkaService.handleTestMessage(payload);
  }
}
