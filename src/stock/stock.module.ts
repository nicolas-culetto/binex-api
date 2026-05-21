import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './models/stock.model';
import { CatalogModule } from 'src/catalog/catalog.module';
import { LoggerModule } from 'src/logger/logger.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  providers: [StockService],
  controllers: [StockController],
  imports: [
    TypeOrmModule.forFeature([Stock]),
    CatalogModule,
    CaslModule,
    LoggerModule
  ],
  exports: [StockService]
})

export class StockModule {}
