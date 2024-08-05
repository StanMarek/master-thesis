import { PartialType } from '@nestjs/mapped-types';
import { CreateMeshDto } from './create-mesh.dto';

export class UpdateMeshDto extends PartialType(CreateMeshDto) {}
