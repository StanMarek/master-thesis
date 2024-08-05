import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlobStorageService } from 'src/blob-storage/blob-storage.service';
import { DBClientService } from 'src/db-client/db-client.service';
import { User } from 'src/user/user.decorator';
import { UploadFileDTO } from './dto/upload-file.dto';

import { Prisma } from '@prisma/client';
import { chunkArray } from 'src/common/util/chunk-array';
import { SocketService } from 'src/socket/socket.service';
import { UserDTO } from 'src/user/dto/user.dto';
import internal from 'stream';
import { UpdateFileDTO } from './dto/update-file.dto';
import { FileService } from './file.service';
import { SocketEventName } from 'src/common/ws';

@Controller('file')
export class FileController {
  constructor(
    @Inject(BlobStorageService)
    private readonly blobStorageService: BlobStorageService,
    @Inject(FileService) private readonly fileService: FileService,
    @Inject(DBClientService) private readonly dbClientService: DBClientService,
    @Inject(SocketService) private readonly socketService: SocketService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getFiles(@User() user: UserDTO) {
    const files = await this.fileService.getFiles(user);

    return files;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getFile(@User() user: UserDTO, @Param('id') id: string) {
    const file = await this.fileService.getFile(user, id);
    const downloadUrl = await this.blobStorageService.getDownloadUrl(file.path);

    delete file.path;

    return { ...file, downloadUrl };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateFile(
    @User() user: UserDTO,
    @Param('id') id: string,
    @Body() updateFileDTO: UpdateFileDTO,
  ) {
    const file = await this.fileService.updateFile(user, id, updateFileDTO);

    return file;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @User() user: UserDTO,
    @Body() uploadFileDto: UploadFileDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'application/octet-stream' })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) return { status: false, message: 'No file uploaded' };
    if (file.originalname.split('.').pop() !== 'vtk')
      return {
        status: false,
        message: 'Invalid file type - required .vtk file',
      };

    try {
      const createdFileMetadata = await this.fileService.createFile(
        user,
        uploadFileDto,
        file,
      );

      await this.blobStorageService.putFile(createdFileMetadata.path, file);
    } catch (error) {
      Logger.error(error);
      return {
        status: false,
        message: 'Error uploading file',
      };
    }

    return {
      status: true,
      message: 'File uploaded successfully',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteFile(@User() user: UserDTO, @Param('id') id: string) {
    const file = await this.fileService.deleteFile(user, id);

    return file;
  }
}
