import { Module } from '@nestjs/common';
import { ModelSegmentsService } from './model-segments.service';
import { ModelSegmentsController } from './model-segments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelSegment } from './models/model-segment.model';
import { ModelsModule } from '../models/models.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [TypeOrmModule.forFeature([ModelSegment]), ModelsModule, CaslModule], 
  providers: [ModelSegmentsService],
  controllers: [ModelSegmentsController],
  exports: [ModelSegmentsService]
})
export class ModelSegmentsModule {}
