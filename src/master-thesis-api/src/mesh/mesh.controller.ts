import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthGuard } from '@nestjs/passport';
import { SocketEventName } from 'src/common/ws';
import { FileService } from 'src/file/file.service';
import { SocketService } from 'src/socket/socket.service';
import { UserDTO } from 'src/user/dto/user.dto';
import { User } from 'src/user/user.decorator';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';
import { MeshService } from './mesh.service';
import { Token } from 'src/user/token.decorator';

@Controller('mesh')
export class MeshController {
  constructor(
    @Inject(MeshService) private readonly meshService: MeshService,
    @Inject(FileService) private readonly fileService: FileService,
    @Inject(SocketService) private readonly socketService: SocketService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('commodity-archive/:id')
  async archiveCommodity(@Param('id') id: string) {
    await this.meshService.archiveCommodity(id);

    return {
      status: true,
      message: 'Commodity archived successfully',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('commodity-calculate/:id')
  async calculateCommodity(@User() user: UserDTO, @Param('id') id: string) {
    await this.meshService.calculateCommodity(user, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('calculate/:id')
  async calculateCommodities(
    @Token() token: string,
    @User() user: UserDTO,
    @Param('id') id: string,
  ) {
    const file = await this.fileService.getFile(user, id);

    if (!file.hasMesh) {
      this.socketService.emit(
        SocketEventName.CALCULATE_MESH_START,
        {
          status: true,
          message: 'Mesh calculation started',
          data: null,
        },
        user.sub,
      );
      // emit event to start mesh calculation
      // this.eventEmitter.emit('client.mesh.calculate.start', {
      //   file,
      //   user,
      // });
      this.eventEmitter.emit('client.mesh.calculate.start.kafka', {
        file,
        user,
        token,
      });

      return {
        status: true,
        message: 'Mesh calculation started',
      };
    }

    return {
      status: true,
      message: 'Commodities calculated successfully',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@User() user: UserDTO) {
    return this.meshService.findAll(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@User() user: UserDTO, @Param('id') id: string) {
    const mesh = await this.meshService.findOne(id, user);

    return mesh;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/vertices')
  async findVertices(@User() user: UserDTO, @Param('id') id: string) {
    const vertices = await this.meshService.findVertices(id, user);

    return vertices;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@User() user: UserDTO, @Param('id') id: string) {
    return this.meshService.remove(id, user);
  }
}
