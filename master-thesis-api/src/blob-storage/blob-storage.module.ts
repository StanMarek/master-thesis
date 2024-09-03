import { Module } from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [BlobStorageService],
  exports: [BlobStorageService],
  imports: [ConfigModule],
})
export class BlobStorageModule {}
