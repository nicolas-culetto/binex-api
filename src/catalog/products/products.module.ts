import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './models/product.model';
import { CaslModule } from 'src/casl/casl.module';
import { ModelsModule } from '../models/models.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CaslModule,
    CloudinaryModule,
    LoggerModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule { }
