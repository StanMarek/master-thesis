import { Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { BUCKET_DEFAUlT_NAME } from 'src/common/const';

export class BlobStorageService implements OnModuleInit {
  private client: Client;

  constructor(@Inject(ConfigService) private config: ConfigService) {}

  onModuleInit() {
    const BLOB_STORAGE_ACCESS = this.config.get<string>('BLOB_STORAGE_ACCESS');
    const BLOB_STORAGE_SECRET = this.config.get<string>('BLOB_STORAGE_SECRET');
    const BLOB_STORAGE_ENDPOINT = this.config.get<string>(
      'BLOB_STORAGE_ENDPOINT',
    );
    const BLOB_STORAGE_PORT = +this.config.get<number>('BLOB_STORAGE_PORT');

    this.client = new Client({
      accessKey: BLOB_STORAGE_ACCESS,
      secretKey: BLOB_STORAGE_SECRET,
      endPoint: BLOB_STORAGE_ENDPOINT,
      port: BLOB_STORAGE_PORT,
      useSSL: false,
    });
  }

  getDownloadUrl(path: string) {
    return this.client.presignedGetObject(BUCKET_DEFAUlT_NAME, path);
  }

  private async createBucket(bucketName = BUCKET_DEFAUlT_NAME) {
    const bucketExists = await this.client.bucketExists(bucketName);
    if (!bucketExists) {
      await this.client.makeBucket(bucketName);
    }
  }

  async getFile(fileName: string, bucketName = BUCKET_DEFAUlT_NAME) {
    await this.createBucket(bucketName);
    if (!fileName) {
      return;
    }

    return this.client.getObject(bucketName, fileName);
  }

  async putFile(
    fileName: string,
    file: Express.Multer.File,
    bucketName = BUCKET_DEFAUlT_NAME,
  ) {
    await this.createBucket(bucketName);

    if (!fileName || !file) {
      return;
    }

    const contentType = file.mimetype;
    const fileSize = file.size;
    await this.client.putObject(bucketName, fileName, file.buffer, fileSize, {
      'Content-Type': contentType,
    });

    return { fileName, fileSize, contentType };
  }
}
