import { Controller, Get, Query } from '@nestjs/common';
import { QueryFiltersDto } from './dtos/query.filters.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(
        private searchService: SearchService
    ) {}

    @Get()
    async search(
        @Query() queryFiltersDto: QueryFiltersDto
    ) {
        return await this.searchService.search(queryFiltersDto);
    }
}
