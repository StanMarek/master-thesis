import { registerAs } from '@nestjs/config';
import { ClientProvider, Transport } from '@nestjs/microservices';

export default registerAs(
  'kafka',
  (): ClientProvider => ({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:29092'],
        clientId: 'kafka-consumer',
      },
      producerOnlyMode: false,
    },
  }),
);
