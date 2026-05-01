import { Module } from '@nestjs/common';
import { SizesService } from './sizes.service';
import { SizesController } from './sizes.controller';
import { LoggerModule } from 'src/logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Size } from './models/size.model';
import { CatalogModule } from '../catalog.module';
import { BrandsModule } from '../brands/brands.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([Size]),
    BrandsModule,
    CaslModule
  ],
  providers: [SizesService],
  controllers: [SizesController],
  exports: [SizesService]
})
export class SizesModule {}
