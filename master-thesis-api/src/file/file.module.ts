import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { DbClientModule } from 'src/db-client/db-client.module';
import { BlobStorageModule } from 'src/blob-storage/blob-storage.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
  imports: [DbClientModule, BlobStorageModule, SocketModule],
})
export class FileModule {}
