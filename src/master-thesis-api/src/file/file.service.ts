import { Inject, Injectable } from '@nestjs/common';
import { UserDTO } from 'src/user/dto/user.dto';
import { UploadFileDTO } from './dto/upload-file.dto';
import { DBClientService } from 'src/db-client/db-client.service';
import { DbClientModule } from 'src/db-client/db-client.module';
import path, { format } from 'path';
import { UpdateFileDTO } from './dto/update-file.dto';
import { has } from 'lodash';

@Injectable()
export class FileService {
  constructor(
    @Inject(DBClientService) private readonly dbClientService: DBClientService,
  ) {}

  async getFiles(user: UserDTO) {
    const files = await this.dbClientService.file.findMany({
      where: {
        owner: user.sub,
      },
    });

    return files.map((file) => {
      const sizeInMb = file.size / (1024 * 1024);
      return {
        id: file.id,
        name: file.name,
        size: `${sizeInMb.toFixed(2)} MB`,
        tags: file.tags,
        description: file.description,
        createdAt: file.createdAt,
      };
    });
  }

  async getFile(user: UserDTO, id: string) {
    const file = await this.dbClientService.file.findUnique({
      where: {
        id,
        owner: user.sub,
      },
      include: {
        mesh: true,
      },
    });

    const sizeInMb = file.size / (1024 * 1024);

    return {
      id: file.id,
      name: file.name,
      size: `${sizeInMb.toFixed(2)} MB`,
      tags: file.tags,
      description: file.description,
      createdAt: file.createdAt,
      format: file.format,
      originalName: file.originalName,
      path: file.path,
      hasMesh: !!file.mesh,
    };
  }

  createFile(
    user: UserDTO,
    uploadFileDto: UploadFileDTO,
    buffer: Buffer,
    file: Express.Multer.File,
  ) {
    const filePath = `${user.sub}/${new Date().getTime()}-${file.originalname
      .trim()
      .toLocaleLowerCase()
      .replace(/ /g, '_')}`;

    return this.dbClientService.file.create({
      data: {
        name: file.originalname,
        originalName: file.originalname,
        format: file.originalname.split('.').pop(),
        size: buffer.byteLength,
        owner: user.sub,
        type: file.mimetype,
        path: filePath,
        tags: uploadFileDto.tags,
        description: uploadFileDto.description,
      },
    });
  }

  async updateFile(user: UserDTO, id: string, updateFileDTO: UpdateFileDTO) {
    const file = await this.dbClientService.file.update({
      where: {
        id,
        owner: user.sub,
      },
      data: {
        name: updateFileDTO.name,
        tags: updateFileDTO.tags,
        description: updateFileDTO.description,
      },
    });

    await this.dbClientService.meshMetadata.update({
      where: {
        owner: user.sub,
        fileId: id,
      },
      data: {
        name: updateFileDTO.name,
      },
    });

    return file;
  }

  deleteFile(user: UserDTO, id: string) {
    return this.dbClientService.file.delete({
      where: {
        id,
        owner: user.sub,
      },
    });
  }
}
