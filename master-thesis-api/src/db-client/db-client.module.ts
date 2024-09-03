import { Module } from '@nestjs/common';
import { DBClientService } from './db-client.service';

@Module({
  providers: [DBClientService],
  exports: [DBClientService],
})
export class DbClientModule {}
