import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { CaslModule } from 'src/casl/casl.module';
import { Brand } from './models/brand.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), CaslModule, CloudinaryModule],
  providers: [BrandsService],
  controllers: [BrandsController],
  exports: [BrandsService]
})
export class BrandsModule {}
