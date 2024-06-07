import { Controller, Get, Inject, UseGuards } from '@nestjs/common';

import { SocketService } from './socket/socket.service';
import { MeshApiService } from './mesh-api/mesh-api.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user/user.decorator';

@Controller()
export class AppController {
  constructor(
    @Inject(SocketService) private readonly socketService: SocketService,
    @Inject(MeshApiService) private readonly meshApiService: MeshApiService,
  ) {}

  @Get('api-health-check')
  healthCheck() {
    return {
      status: true,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('ws-connection-status')
  wsConnectionEstablished(@User() user: any) {
    return {
      status: this.socketService.connectionEstablished(user.sub),
    };
  }

  @Get('mesh-api-health-check')
  async meshApiHealthCheck() {
    const status = await this.meshApiService.checkMeshApiHealth();
    return {
      status,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('kafka-health-check')
  async kafkaHealthCheck(@User() user: any) {
    const status = await this.meshApiService.checkKafkaHealth(user.sub);
    return {
      status,
    };
  }
}
