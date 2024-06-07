import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [SocketGateway, SocketService],
  exports: [SocketService, SocketGateway],
  imports: [JwtModule],
})
export class SocketModule {}
