import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from './models/model.model';
import { CaslModule } from 'src/casl/casl.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ModelSegmentsModule } from '../model-segments/model-segments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Model]), 
    CaslModule, 
    LoggerModule,
    ModelSegmentsModule
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService]
})
export class ModelsModule {}
