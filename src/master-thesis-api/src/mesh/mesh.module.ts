import { Module } from '@nestjs/common';
import { MeshService } from './mesh.service';
import { MeshController } from './mesh.controller';
import { DbClientModule } from 'src/db-client/db-client.module';
import { SocketModule } from 'src/socket/socket.module';
import { FileModule } from 'src/file/file.module';
import { BlobStorageModule } from 'src/blob-storage/blob-storage.module';

@Module({
  controllers: [MeshController],
  providers: [MeshService],
  imports: [DbClientModule, SocketModule, FileModule, BlobStorageModule],
})
export class MeshModule {}
