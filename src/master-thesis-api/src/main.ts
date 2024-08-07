import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { checkEnvs } from './common/util/check-envs';
import { ValidationPipe } from '@nestjs/common';
import { REQUIRED_ENVS } from './common/const';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const KAFKA_BROKER = configService.get<string>('KAFKA_BROKER');
  const KAFKA_CLIENT_ID = configService.get<string>('KAFKA_CLIENT_ID');

  checkEnvs(REQUIRED_ENVS);

  // TEMP DISABLE KAFKA
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [KAFKA_BROKER],
        clientId: KAFKA_CLIENT_ID,
      },
    },
  });

  app.enableCors({
    origin: '*',
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    // allowedHeaders: [
    //   'Content-Type',
    //   'Authorization',
    //   'X-Requested-With',
    //   'Accept',
    //   'Authorization',
    // ],
  });
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
