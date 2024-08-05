import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { MeshService } from './mesh.service';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/user.decorator';
import { UserDTO } from 'src/user/dto/user.dto';
import { FileService } from 'src/file/file.service';
import { BlobStorageService } from 'src/blob-storage/blob-storage.service';
import internal from 'stream';
import { chunkArray } from 'src/common/util/chunk-array';
import { DBClientService } from 'src/db-client/db-client.service';
import { Prisma } from '@prisma/client';
import { Socket } from 'socket.io';
import { SocketService } from 'src/socket/socket.service';
import { SocketEventName } from 'src/common/ws';

@Controller('mesh')
export class MeshController {
  constructor(
    @Inject(MeshService) private readonly meshService: MeshService,
    @Inject(FileService) private readonly fileService: FileService,
    @Inject(DBClientService) private readonly dbClientService: DBClientService,
    @Inject(BlobStorageService)
    private readonly blobStorageService: BlobStorageService,
    @Inject(SocketService) private readonly socketService: SocketService,
  ) {}

  @Post()
  create(@Body() createMeshDto: CreateMeshDto) {
    return this.meshService.create(createMeshDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('calculate/:id')
  async calculateCommodities(@User() user: UserDTO, @Param('id') id: string) {
    const file = await this.fileService.getFile(user, id);
    const blob = await this.blobStorageService.getFile(file.path);

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

      console.log(dataMapping);

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meshService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeshDto: UpdateMeshDto) {
    return this.meshService.update(+id, updateMeshDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meshService.remove(+id);
  }
}
