import { Test, TestingModule } from '@nestjs/testing';
import { MeshService } from './mesh.service';

describe('MeshService', () => {
  let service: MeshService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeshService],
    }).compile();

    service = module.get<MeshService>(MeshService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
