import { Test, TestingModule } from '@nestjs/testing';
import { MeshController } from './mesh.controller';
import { MeshService } from './mesh.service';

describe('MeshController', () => {
  let controller: MeshController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeshController],
      providers: [MeshService],
    }).compile();

    controller = module.get<MeshController>(MeshController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
