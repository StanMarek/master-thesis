import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';
import { UserDTO } from 'src/user/dto/user.dto';
import { DBClientService } from 'src/db-client/db-client.service';
import { OnEvent } from '@nestjs/event-emitter';
import { File, Prisma } from '@prisma/client';
import { BlobStorageService } from 'src/blob-storage/blob-storage.service';
import internal from 'stream';
import { chunkArray } from 'src/common/util/chunk-array';
import { SocketService } from 'src/socket/socket.service';
import { SocketEventName } from 'src/common/ws';

@Injectable()
export class MeshService {
  constructor(
    @Inject(DBClientService) private readonly dbClientService: DBClientService,
    @Inject(BlobStorageService)
    private readonly blobStorageService: BlobStorageService,
    @Inject(SocketService) private readonly socketService: SocketService,
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
        meshCommodites: true,
      },
    });

    return mesh.map((m) => {
      return {
        id: m.id,
        name: m.name,
        description: m.description,
        createdAt: m.createdAt,
        verticesCount: m.verticesCount,
        commodities: m.meshCommodites
          .filter((mc) => mc.visible)
          .map((mc) => mc.name),
      };
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} mesh`;
  }

  update(id: number, updateMeshDto: UpdateMeshDto) {
    return `This action updates a #${id} mesh`;
  }

  remove(id: number) {
    return `This action removes a #${id} mesh`;
  }

  @OnEvent('client.mesh.calculate.start')
  async calculateMesh(payload: { file: File; user: UserDTO }) {
    const { file, user } = payload;

    try {
      const blob = await this.blobStorageService.getFile(file.path);

      async function stream2buffer(stream: internal.Readable): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
          const _buf = Array<any>();

          stream.on('data', (chunk) => _buf.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(_buf)));
          stream.on('error', (err) =>
            reject(`error converting stream - ${err}`),
          );
        });
      }

      const buffer = await stream2buffer(blob);
      const parsedBuffer = buffer.toString().split('\n');

      const dataMapping = parsedBuffer
        .map((line, index) => {
          let isVtkLine = false;
          const split = line
            .trim()
            .split(' ')
            .filter((item) => item !== ' ' && item !== '')
            .forEach((item) => {
              if (!Number(item) && Number(item) !== 0) isVtkLine = true;
            });

          if (isVtkLine) return { lineNumber: index, line };
        })
        .filter(Boolean)
        .map((item, index) => {
          return { ...item, itemIndex: index };
        });

      const pointsStartIndex = dataMapping.find((item) =>
        item.line.startsWith('POINTS'),
      );
      const pointsEndIndex = dataMapping.at(
        dataMapping.indexOf(pointsStartIndex) + 1,
      );

      // const pointsEndIndex = dataMapping.find((item) => item.index).index;
      const pointsCoordinates = chunkArray(
        parsedBuffer
          .slice(pointsStartIndex.lineNumber + 1, pointsEndIndex.lineNumber)
          .flatMap((line) => {
            return line
              .trim()
              .split(' ')
              .filter((line) => line !== ' ' && line !== '')
              .map((item) => Number(item));
          }),
      ).map((chunk) => {
        return {
          x: chunk[0],
          y: chunk[1],
          z: chunk[2],
        };
      });

      const mesh = await this.dbClientService.meshMetadata.create({
        data: {
          name: file.name,
          owner: user.sub,
          verticesCount: pointsCoordinates.length,
          file: {
            connect: {
              id: file.id,
            },
          },
        },
      });

      const meshCommoditiesCreateManyInput: Prisma.MeshCommodityCreateManyInput[] =
        dataMapping.map((d) => ({
          meshId: mesh.id,
          fileLineIndex: d.lineNumber,
          name: d.line,
        }));

      await this.dbClientService.meshCommodity.createMany({
        data: meshCommoditiesCreateManyInput,
      });

      this.socketService.emit(
        SocketEventName.CALCULATE_MESH_END,
        {
          status: true,
          message: 'Mesh calculated successfully',
          data: null,
        },
        user.sub,
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
        user.sub,
      );
    }
  }
}
