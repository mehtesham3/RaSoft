import { Test, TestingModule } from '@nestjs/testing';
import { TenanController } from './tenan.controller.js';
import { TenanService } from './tenan.service.js';

describe('TenanController', () => {
  let controller: TenanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenanController],
      providers: [TenanService],
    }).compile();

    controller = module.get<TenanController>(TenanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
