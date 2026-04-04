import { Module } from '@nestjs/common';
import { BrandsModule } from './brands/brands.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [BrandsModule, CloudinaryModule, CaslModule],
  providers: [],
  controllers: [],
  exports: [BrandsModule]
})
export class CatalogModule {}
