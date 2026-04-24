import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { CatalogModule } from 'src/catalog/catalog.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelSegment } from 'src/catalog/model-segments/models/model-segment.model';

@Module({
  imports: [
    CatalogModule,
    TypeOrmModule.forFeature([ModelSegment])
  ],
  providers: [SearchService],
  controllers: [SearchController]
})
export class SearchModule {}
