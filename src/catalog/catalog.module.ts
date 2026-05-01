import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { ModelsModule } from './models/models.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CaslModule } from 'src/casl/casl.module';
import { ModelSegmentsModule } from './model-segments/model-segments.module';
import { SizesModule } from './sizes/sizes.module';

@Module({
  imports: [ProductsModule, BrandsModule, ModelsModule, CloudinaryModule, CaslModule, ModelSegmentsModule, SizesModule],
  providers: [],
  controllers: [],
  exports: [ProductsModule, BrandsModule, ModelsModule, SizesModule]
})
export class CatalogModule {}
