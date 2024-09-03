import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DbClientModule } from './db-client/db-client.module';
import { BlobStorageModule } from './blob-storage/blob-storage.module';
import { KafkaModule } from './kafka/kafka.module';
import { Auth0Module } from './auth0/auth0.module';

import { SocketModule } from './socket/socket.module';
import { MeshApiModule } from './mesh-api/mesh-api.module';
import { FileModule } from './file/file.module';
import { MeshModule } from './mesh/mesh.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    KafkaModule,
    DbClientModule,
    BlobStorageModule,
    Auth0Module,

    SocketModule,

    MeshApiModule,

    FileModule,

    MeshModule,

    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
