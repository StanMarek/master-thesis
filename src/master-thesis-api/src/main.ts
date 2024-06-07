import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { checkEnvs } from './util/check-envs';
import { ValidationPipe } from '@nestjs/common';

export const REQUIRED_ENVS = [
  'KAFKA_BROKER',
  'KAFKA_CLIENT_ID',
  'KAFKAJS_NO_PARTITIONER_WARNING',
  'BLOB_STORAGE_ACCESS',
  'BLOB_STORAGE_SECRET',
  'BLOB_STORAGE_ENDPOINT',
  'BLOB_STORAGE_PORT',
  'DB_CONNECTION_STRING',
  'AUTH0_PORT',
  'AUTH0_ISSUER_URL',
  'AUTH0_AUDIENCE',
] as const;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const KAFKA_BROKER = configService.get<string>('KAFKA_BROKER');
  const KAFKA_CLIENT_ID = configService.get<string>('KAFKA_CLIENT_ID');

  checkEnvs(REQUIRED_ENVS);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [KAFKA_BROKER],
        clientId: KAFKA_CLIENT_ID,
      },
    },
  });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
    }),
  );

  app.setGlobalPrefix('api');
  app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
