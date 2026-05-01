import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { PoliciesGuard } from 'src/casl/guards/policies/policies.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/casl/models/action.enum';
import { IncreaseStockDto } from './dtos/increase.stock.dto';
import { DecreaseStockDto } from './dtos/decrease.stock.dto';
import { Stock } from './models/stock.model';
import { AdjustStockDto } from './dtos/adjust.stock.dto';
import { FiltersStockDto } from './dtos/filters.stock.dto';

@Controller('stock')
export class StockController {
    constructor(
        private stockService: StockService
    ) { }

    @Put('increase')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'all'))
    async increase(
        @Query('productId') productId: number,
        @Query('sizeId') sizeId: number,
        @Body() increaseStockDto: IncreaseStockDto
    ): Promise<Stock> {
        return await this.stockService.increase(productId, sizeId, increaseStockDto);
    }

    @Put('decrease/:sku')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'all'))
    async decrease(
        @Param('sku') sku: string,
        @Body() decreaseStockDto: DecreaseStockDto
    ): Promise<Stock> {
        return await this.stockService.decrease(sku, decreaseStockDto);
    }

    @Put('adjust/:sku')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'all'))
    async adjust(
        @Param('sku') sku: string,
        @Body() adjustStockDto: AdjustStockDto
    ): Promise<Stock> {
        return await this.stockService.adjust(sku, adjustStockDto);
    }

    @Get('find-by-sku/:sku')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'all'))
    async findBySku(@Param('sku') sku: string): Promise<Stock> {
        return await this.stockService.getBySku(sku);
    }

    @Get('find')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'all'))
    async find(@Query() filtersStockDto: FiltersStockDto): Promise<Stock[]> {
        return await this.stockService.get(filtersStockDto);
    }
}
