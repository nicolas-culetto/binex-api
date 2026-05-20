import { Module } from '@nestjs/common';
import { ModelSegmentsService } from './model-segments.service';
import { ModelSegmentsController } from './model-segments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelSegment } from './models/model-segment.model';
import { CaslModule } from 'src/casl/casl.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModelSegment]), 
    CaslModule,
    LoggerModule,
    ProductsModule
  ], 
  providers: [ModelSegmentsService],
  controllers: [ModelSegmentsController],
  exports: [ModelSegmentsService]
})
export class ModelSegmentsModule {}
