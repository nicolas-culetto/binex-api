import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { PoliciesGuard } from 'src/casl/guards/policies/policies.guard';
import { Action } from 'src/casl/models/action.enum';
import { CreateSizeDto } from './dtos/create.size.dto';
import { Size } from './models/size.model';
import { SizesService } from './sizes.service';
import { GetSizesDto } from './dtos/get.sizes.dto';
import { UpdateSizeDto } from './dtos/update.size.dto';
import { DeleteResult } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';

@Controller('sizes')
export class SizesController {
    constructor(
        private sizesService: SizesService
    ) {}

    @Post('create')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'all'))
    async create(
        @Body() createSizeDto: CreateSizeDto
    ): Promise<Size> {
        return await this.sizesService.create(createSizeDto);
    }

    @Get('get-by-brand')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'all'))
    async getByBrand(
        @Query() getSizesDto: GetSizesDto
    ): Promise<Size[]> {
        return await this.sizesService.getSizes(getSizesDto);
    }

    @Put('update/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'all'))
    async update(
        @Param('id') id: number,
        @Body() updateSizeDto: UpdateSizeDto
    ): Promise<Size> {
        return await this.sizesService.update(id, updateSizeDto);
    }

    @Delete('delete/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'all'))
    async remove(
        @Param('id') id: number,
    ): Promise<DeleteResult> {
        return await this.sizesService.remove(id);
    }

    @Put('restore/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'all'))
    async restore(
        @Param('id') id: number,
    ): Promise<UpdateResult> {
        return await this.sizesService.restore(id);
    }
}
