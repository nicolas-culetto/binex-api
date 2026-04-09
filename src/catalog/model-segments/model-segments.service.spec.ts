import { Test, TestingModule } from '@nestjs/testing';
import { ModelSegmentsService } from './model-segments.service';

describe('ModelSegmentsService', () => {
  let service: ModelSegmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelSegmentsService],
    }).compile();

    service = module.get<ModelSegmentsService>(ModelSegmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
