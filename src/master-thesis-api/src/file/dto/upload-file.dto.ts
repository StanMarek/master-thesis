import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UploadFileDTO {
  @IsString()
  @IsNotEmpty()
  filename?: string;

  // @IsNumber()
  @IsString()
  @IsNotEmpty()
  chunkIndex: string;

  // @IsNumber()
  @IsString()
  @IsNotEmpty()
  totalChunks: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
