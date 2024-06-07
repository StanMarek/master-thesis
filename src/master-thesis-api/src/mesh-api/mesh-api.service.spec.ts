import { Test, TestingModule } from '@nestjs/testing';
import { MeshApiService } from './mesh-api.service';

describe('MeshApiService', () => {
  let service: MeshApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeshApiService],
    }).compile();

    service = module.get<MeshApiService>(MeshApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
