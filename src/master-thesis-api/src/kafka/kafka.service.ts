import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Kafka as KafkaConsumer } from '@nestjs/microservices/external/kafka.interface';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafkaClient: KafkaConsumer;

  constructor(
    @Inject('KAFKA_BROKER') private readonly kafkaBroker: ClientKafka,
  ) {}

  onModuleInit() {
    this.kafkaClient = this.kafkaBroker.createClient();

    this.kafkaClient
      .consumer({
        groupId: 'kafka-consumer',
      })
      .connect()
      .then(() => {
        console.log('Kafka consumer connected');
      });

    this.kafkaClient
      .consumer({
        groupId: 'kafka-consumer',
      })
      .subscribe({ topic: 'test-topic' });
  }
}
