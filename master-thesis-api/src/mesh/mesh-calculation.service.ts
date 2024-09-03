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
import { interpolateColor } from 'src/common/util/interpolate-colot';
import { connect } from 'http2';
import { all } from 'axios';

type Point = [number, number, number];
type Edge = {
  start: Point;
  end: Point;
  startIndex: number;
  endIndex: number;
};
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

    // const pointsCoordinates = this.extractPointsCoordinates(
    //   dataMapping,
    //   parsedBuffer,
    // );
    const { points, edges } = this.extractPointsAndEdges(parsedBuffer);
    // console.log(points.edges.length);
    // console.log(points.points[0]);

    // return;
    const mesh = await this.dbClientService.meshMetadata.create({
      data: {
        name: file.name,
        owner: user.sub,
        verticesCount: points.length,
        file: {
          connect: {
            id: file.id,
          },
        },
      },
    });

    const pointsCoordinates = points.map((point) => ({
      x: point[0],
      y: point[1],
      z: point[2],
    }));
    console.log();
    const edgesCoordinates = edges;
    console.log(edgesCoordinates.length);

    await this.createMeshCommodities(mesh.id, dataMapping);
    await this.createMeshVertices(mesh.id, pointsCoordinates);
    await this.createMeshEdges(mesh.id, edgesCoordinates);
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

  extractPointsAndEdges(lines: string[]): {
    points: Point[];
    edges: Edge[];
  } {
    const edges = new Set<string>();

    const allCoords: number[] = [];

    let inPointsSection = false;
    let inCellsSection = false;
    let inOffsetsSection = false;
    let inConnectivitySection = false;
    let inCellTypesSection = false;
    const idx = [];

    let numPoints = 0;
    let numCells = 0;
    let offsets: number[] = [];
    let connectivity: number[] = [];
    let cellTypes: number[] = [];

    lines.forEach((line, i) => {
      const trimmedLine = line.trim();

      // Detect start of points section
      if (trimmedLine.startsWith('POINTS')) {
        inPointsSection = true;
        const parts = trimmedLine.split(' ');
        numPoints = parseInt(parts[1], 10);
        console.log('numPoints', numPoints);
        return;
      }

      // Read points
      if (inPointsSection) {
        const coords = trimmedLine.split(' ').map(Number);

        allCoords.push(...coords.map(Number));
        if (allCoords.length === numPoints * 3) {
          inPointsSection = false;
          return;
        }
      }

      // Detect start of connectivity section
      if (trimmedLine.startsWith('CONNECTIVITY')) {
        inOffsetsSection = false;
        inConnectivitySection = true;
        return;
      }

      if (trimmedLine.startsWith('CELL_TYPES')) {
        inConnectivitySection = false;
        return;
      }

      // Read connectivity
      if (inConnectivitySection) {
        connectivity.push(...trimmedLine.split(' ').map(Number));
      }
    });

    const points: Point[] = chunkArray(allCoords.flat(), 3).map((coords) => [
      coords[0],
      coords[1],
      coords[2],
    ]);

    for (let i = 0; i < connectivity.length; i += 4) {
      const a = connectivity[i];
      const b = connectivity[i + 1];
      const c = connectivity[i + 2];
      const d = connectivity[i + 3];
      edges.add(`${a}-${b}`);
      edges.add(`${b}-${c}`);
      edges.add(`${c}-${a}`);
      edges.add(`${a}-${d}`);
      edges.add(`${b}-${d}`);
      edges.add(`${c}-${d}`);
    }

    const edgesArray = Array.from(edges).map((edge) => {
      const [a, b] = edge.split('-').map(Number);
      return {
        startIndex: a,
        endIndex: b,
        start: points[a],
        end: points[b],
      } as Edge;
    });

    console.log('edgesArray', edgesArray.length);

    return { points, edges: edgesArray };
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

  private async createMeshEdges(meshId: string, edgesCoordinates: Edge[]) {
    await this.dbClientService.meshEdge.createMany({
      data: edgesCoordinates.map((edge) => ({
        meshId,
        start: edge.startIndex,
        end: edge.endIndex,
        data: [...edge.start, ...edge.end],
      })),
    });
  }
}
