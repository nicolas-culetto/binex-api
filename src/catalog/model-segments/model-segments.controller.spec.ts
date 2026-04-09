import { Test, TestingModule } from '@nestjs/testing';
import { ModelSegmentsController } from './model-segments.controller';

describe('ModelSegmentsController', () => {
  let controller: ModelSegmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModelSegmentsController],
    }).compile();

    controller = module.get<ModelSegmentsController>(ModelSegmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
