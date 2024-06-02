import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ClientProvider, ClientsModule } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import kafkaConfig from 'src/config/kafka.config';
import { KafkaController } from './kafka.controller';

@Module({
  providers: [KafkaService],
  controllers: [KafkaController],
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule.forFeature(kafkaConfig)],
        useFactory: async (configService: ConfigService) =>
          configService.get<ClientProvider>('kafka'),
        name: 'KAFKA_BROKER',
        inject: [ConfigService],
      },
    ]),
  ],
})
export class KafkaModule {}
