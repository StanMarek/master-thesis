import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Transport } from '@nestjs/microservices';

@Controller()
export class KafkaController {
  constructor() {}

  @EventPattern('test-topic', Transport.KAFKA)
  handleKafkaMessage(@Payload() payload: any) {
    console.log('Received message kafka controller:', payload);
  }
}
