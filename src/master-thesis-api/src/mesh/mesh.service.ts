import { Inject, Injectable } from '@nestjs/common';
import { CreateMeshDto } from './dto/create-mesh.dto';
import { UpdateMeshDto } from './dto/update-mesh.dto';
import { UserDTO } from 'src/user/dto/user.dto';
import { DBClientService } from 'src/db-client/db-client.service';

@Injectable()
export class MeshService {
  constructor(
    @Inject(DBClientService) private readonly dbClientService: DBClientService,
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
}
