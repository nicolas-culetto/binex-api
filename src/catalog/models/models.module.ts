import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from './models/model.model';
import { CaslModule } from 'src/casl/casl.module';
import { BrandsModule } from '../brands/brands.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Model]), 
    BrandsModule, 
    CaslModule, 
    LoggerModule
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService]
})
export class ModelsModule {}
