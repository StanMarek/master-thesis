import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';
import { UserDTO } from 'src/user/dto/user.dto';
import { DBClientService } from 'src/db-client/db-client.service';
import { OnEvent } from '@nestjs/event-emitter';
import { File, MeshCommodityTag, Prisma } from '@prisma/client';
import { BlobStorageService } from 'src/blob-storage/blob-storage.service';
import internal from 'stream';
import { chunkArray } from 'src/common/util/chunk-array';
import { SocketService } from 'src/socket/socket.service';
import { SocketEventName } from 'src/common/ws';
import {
  dataConstants,
  dataConstantsName,
  dataConstantsTagMap,
} from 'src/common/const';
import { streamToBuffer } from 'src/common/util/stream-to-buffer';
import { MeshCalculationService } from './mesh-calculation.service';

@Injectable()
export class MeshService {
  constructor(
    @Inject(DBClientService) private readonly dbClientService: DBClientService,
    @Inject(SocketService) private readonly socketService: SocketService,
    @Inject(MeshCalculationService)
    private readonly meshCalculationService: MeshCalculationService,
  ) {}

  create(createMeshDto: CreateMeshDto) {
    return 'This action adds a new mesh';
  }

  async findAll(user: UserDTO) {
    const mesh = await this.dbClientService.meshMetadata.findMany({
      where: {
        owner: user.sub,
      },
      include: {
        meshCommodities: true,
      },
    });

    return mesh.map((m) => {
      return {
        id: m.id,
        name: m.name,
        description: m.description,
        createdAt: m.createdAt,
        verticesCount: m.verticesCount,
        commodities: m.meshCommodities
          .filter((mc) => mc.visible)
          .map((mc) => mc.name),
      };
    });
  }

  async findOne(id: string, user: UserDTO) {
    return this.dbClientService.meshMetadata.findUnique({
      where: {
        id,
        owner: user.sub,
      },
      include: {
        meshCommodities: {
          where: {
            visible: true,
          },
        },
      },
    });
  }

  async findVertices(id: string, user: UserDTO) {
    const mesh = await this.dbClientService.meshMetadata.findUnique({
      where: {
        id,
        owner: user.sub,
      },
    });

    return this.dbClientService.meshVertice.findMany({
      where: {
        meshId: mesh.id,
      },
    });
  }

  update(id: number, updateMeshDto: UpdateMeshDto) {
    return `This action updates a #${id} mesh`;
  }

  remove(id: number) {
    return `This action removes a #${id} mesh`;
  }

  @OnEvent('client.mesh.calculate.start')
  async calculateMesh(payload: { file: File; user: UserDTO }) {
    try {
      await this.meshCalculationService.calculate(payload.file, payload.user);
      this.socketService.emit(
        SocketEventName.CALCULATE_MESH_END,
        {
          status: true,
          message: 'Mesh calculated successfully',
          data: null,
        },
        payload.user.sub,
      );
    } catch (error) {
      Logger.error(error);
      this.socketService.emit(
        SocketEventName.CALCULATE_MESH_FAILED,
        {
          status: false,
          message: 'Mesh calculation failed',
          data: error.toString(),
        },
        payload.user.sub,
      );
    }
  }
}
