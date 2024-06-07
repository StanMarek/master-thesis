import { Module } from '@nestjs/common';
import { MeshApiService } from './mesh-api.service';

@Module({
  providers: [MeshApiService],
  exports: [MeshApiService],
})
export class MeshApiModule {}
