import { IsArray, IsOptional, IsString } from 'class-validator';

export class UploadFileDTO {
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
