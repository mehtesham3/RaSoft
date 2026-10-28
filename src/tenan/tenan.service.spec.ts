import { Test, TestingModule } from '@nestjs/testing';
import { TenanService } from './tenan.service.js';

describe('TenanService', () => {
  let service: TenanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenanService],
    }).compile();

    service = module.get<TenanService>(TenanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
