import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { File } from '@prisma/client';
import axios from 'axios';
import { SocketEventName } from 'src/common/ws';
import { DBClientService } from 'src/db-client/db-client.service';
import { SocketService } from 'src/socket/socket.service';
import { UserDTO } from 'src/user/dto/user.dto';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';
import { MeshCalculationService } from './mesh-calculation.service';

@Injectable()
export class MeshService {
  constructor(
    @Inject(DBClientService) private readonly dbClientService: DBClientService,
    @Inject(SocketService) private readonly socketService: SocketService,
    @Inject(MeshCalculationService)
    private readonly meshCalculationService: MeshCalculationService,
  ) {}

  async calculateCommodity(user: UserDTO, id: string) {
    const commodity = await this.dbClientService.meshCommodity.findUnique({
      where: {
        id,
      },
    });

    if (!commodity || commodity.tag !== 'TEMPERATURE') {
      this.socketService.emit(
        SocketEventName.CALCULATE_COMMODITY_START,
        {
          status: false,
          message: 'Commodity calculation failed',
          data: 'Commodity not found or not a temperature commodity',
        },
        user.sub,
      );
      return;
    }

    this.socketService.emit(
      SocketEventName.CALCULATE_COMMODITY_START,
      {
        status: true,
        message: 'Commodity calculation started',
        data: null,
      },
      user.sub,
    );

    await this.meshCalculationService.calculateCommodity(commodity.id);

    this.socketService.emit(
      SocketEventName.CALCULATE_COMMODITY_END,
      {
        status: true,
        message: 'Commodity calculated successfully',
        data: null,
      },
      user.sub,
    );
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

    const vertices = await this.dbClientService.meshVertice.findMany({
      where: {
        meshId: mesh.id,
      },
      include: {
        value: true,
      },
    });

    return vertices.map((v) => {
      return {
        x: v.x,
        y: v.y,
        z: v.z,
        value: v.value[0]?.value ?? 0,
        color: v.value[0]?.color ?? 'blue',
      };
    });
  }

  remove(id: string, user: UserDTO) {
    return this.dbClientService.meshMetadata.delete({
      where: {
        id,
        owner: user.sub,
      },
    });
  }

  archiveCommodity(id: string) {
    return this.dbClientService.meshCommodity.update({
      where: {
        id,
      },
      data: {
        visible: false,
      },
    });
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

  @OnEvent('client.mesh.calculate.start.kafka')
  async calculateMeshKafka(payload: {
    file: File;
    user: UserDTO;
    token: string;
  }) {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/mesh/calculate',
        {
          fileId: payload.file.id,
          sub: payload.user.sub,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payload.token}`,
          },
        },
      );

      if (response.status === 200) {
        this.socketService.emit(
          SocketEventName.CALCULATE_MESH_START,
          {
            status: true,
            message: 'Mesh calculation started',
            data: null,
          },
          payload.user.sub,
        );
      } else {
        this.socketService.emit(
          SocketEventName.CALCULATE_MESH_FAILED,
          {
            status: false,
            message: 'Mesh calculation failed',
            data: response.data,
          },
          payload.user.sub,
        );
      }
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
