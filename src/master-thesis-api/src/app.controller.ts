import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  EventPattern,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('test-topic', Transport.KAFKA)
  handleKafkaMessage(@Payload() payload: any) {
    console.log('Received message event:', payload);
  }

  @MessagePattern('test-topic', Transport.KAFKA)
  handleMessage(@Payload() payload: any) {
    console.log('Received message message:', payload);
  }
}
