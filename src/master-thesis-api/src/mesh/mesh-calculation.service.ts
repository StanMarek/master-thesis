import { Injectable, Inject } from '@nestjs/common';
import { DBClientService } from 'src/db-client/db-client.service';
import { BlobStorageService } from 'src/blob-storage/blob-storage.service';
import { UserDTO } from 'src/user/dto/user.dto';
import { File, MeshCommodityTag, Prisma } from '@prisma/client';
import { chunkArray } from 'src/common/util/chunk-array';
import { streamToBuffer } from 'src/common/util/stream-to-buffer';
import {
  dataConstants,
  dataConstantsName,
  dataConstantsTagMap,
} from 'src/common/const';

@Injectable()
export class MeshCalculationService {
  constructor(
    @Inject(DBClientService) private readonly dbClientService: DBClientService,
    @Inject(BlobStorageService)
    private readonly blobStorageService: BlobStorageService,
  ) {}

  async calculateCommodity(commodityId: string) {
    const commodity = await this.dbClientService.meshCommodity.findUnique({
      where: {
        id: commodityId,
      },
      include: {
        mesh: {
          include: {
            file: true,
          },
        },
      },
    });

    const allCommodities = await this.dbClientService.meshCommodity.findMany({
      where: {
        meshId: commodity.meshId,
      },
      orderBy: {
        fileLineIndex: 'asc',
      },
    });

    const index = allCommodities.findIndex((c) => c.id === commodity.id);
    const nextCommodity = allCommodities[index + 2];

    const commodityLineStartIndex = commodity.fileLineIndex + 2;
    const commodityLineEndIndex = nextCommodity.fileLineIndex;

    const filePath = commodity.mesh.file.path;
    const blob = await this.blobStorageService.getFile(filePath);
    const buffer = await streamToBuffer(blob);
    const parsedBuffer = buffer.toString().split('\n');

    const dataArray = chunkArray(
      parsedBuffer
        .slice(commodityLineStartIndex, commodityLineEndIndex)
        .flatMap((line) =>
          line
            .trim()
            .split(' ')
            .filter((line) => line !== ' ' && line !== '')
            .map((item) => Number(item)),
        ),
    ).flat();

    const rangeMax = Math.max(...dataArray);
    const rangeMin = Math.min(...dataArray);
    await this.dbClientService.meshCommodity.update({
      where: {
        id: commodity.id,
      },
      data: {
        rangeMax,
        rangeMin,
      },
    });

    const vertices = await this.dbClientService.meshVertice.findMany({
      where: {
        meshId: commodity.meshId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    const commodityVerticeData: Prisma.MeshCommodityVerticeDataCreateManyInput[] =
      dataArray.map((value, index) => {
        return {
          value,
          verticeId: vertices[index].id,
          meshCommodityId: commodity.id,
          color: interpolateColor(value, rangeMin, rangeMax),
        };
      });

    await this.dbClientService.meshCommodityVerticeData.createMany({
      data: commodityVerticeData,
    });
  }

  async calculate(file: File, user: UserDTO) {
    const blob = await this.blobStorageService.getFile(file.path);
    const buffer = await streamToBuffer(blob);
    const parsedBuffer = buffer.toString().split('\n');

    const dataMapping = this.mapData(parsedBuffer);

    const pointsCoordinates = this.extractPointsCoordinates(
      dataMapping,
      parsedBuffer,
    );

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

    await this.createMeshCommodities(mesh.id, dataMapping);
    await this.createMeshVertices(mesh.id, pointsCoordinates);
  }

  private mapData(parsedBuffer: string[]) {
    return parsedBuffer
      .map((line, index) => {
        let isVtkLine = false;
        line
          .trim()
          .split(' ')
          .filter((item) => item !== ' ' && item !== '')
          .forEach((item) => {
            if (!Number(item) && Number(item) !== 0) isVtkLine = true;
          });

        if (isVtkLine) return { lineNumber: index, line };
      })
      .filter(Boolean)
      .map((item, index) => ({ ...item, itemIndex: index }));
  }

  private extractPointsCoordinates(dataMapping: any[], parsedBuffer: string[]) {
    const pointsStartIndex = dataMapping.find((item) =>
      item.line.startsWith('POINTS'),
    );
    const pointsEndIndex = dataMapping.at(
      dataMapping.indexOf(pointsStartIndex) + 1,
    );

    return chunkArray(
      parsedBuffer
        .slice(pointsStartIndex.lineNumber + 1, pointsEndIndex.lineNumber)
        .flatMap((line) =>
          line
            .trim()
            .split(' ')
            .filter((line) => line !== ' ' && line !== '')
            .map((item) => Number(item)),
        ),
    ).map((chunk) => ({
      x: chunk[0],
      y: chunk[1],
      z: chunk[2],
    }));
  }

  private async createMeshCommodities(meshId: string, dataMapping: any[]) {
    const meshCommoditiesCreateManyInput: Prisma.MeshCommodityCreateManyInput[] =
      dataMapping.map((d) => {
        if (!dataConstants.some((dc) => d.line.startsWith(dc))) {
          return {
            meshId,
            fileLineIndex: d.lineNumber,
            name: d.line,
            originalName: d.line,
            visible: false,
            tag: MeshCommodityTag.UNKNOWN,
          };
        } else {
          const name = d.line
            .split(' ')
            .find((item) => dataConstantsName.includes(item as any));

          return {
            meshId,
            fileLineIndex: d.lineNumber,
            name,
            originalName: d.line,
            tag: dataConstantsTagMap[name as keyof typeof dataConstantsName],
          };
        }
      });

    await this.dbClientService.meshCommodity.createMany({
      data: meshCommoditiesCreateManyInput,
    });
  }

  private async createMeshVertices(
    meshId: string,
    pointsCoordinates: {
      x: number;
      y: number;
      z: number;
    }[],
  ) {
    await this.dbClientService.meshVertice.createMany({
      data: pointsCoordinates.map((point, index) => ({
        x: point.x,
        y: point.y,
        z: point.z,
        meshId,
        order: index,
      })),
    });
  }
}
