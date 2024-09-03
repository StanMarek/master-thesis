import { IsOptional } from 'class-validator';

export class UpdateFileDTO {
  @IsOptional()
  name?: string;

  @IsOptional()
  tags?: string[];

  @IsOptional()
  description?: string;
}
