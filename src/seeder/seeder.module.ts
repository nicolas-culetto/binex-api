import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { CatalogModule } from 'src/catalog/catalog.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { StockService } from 'src/stock/stock.service';
import { StockModule } from 'src/stock/stock.module';

@Module({
  providers: [SeederService],
  imports: [CatalogModule, CloudinaryModule, ConfigModule, StockModule]
})
export class SeederModule {}
