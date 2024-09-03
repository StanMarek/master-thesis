import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  controllers: [KafkaController],
  providers: [KafkaService],
  imports: [SocketModule],
})
export class KafkaModule {}
