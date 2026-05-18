import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { PoliciesGuard } from 'src/casl/guards/policies/policies.guard';
import { Action } from 'src/casl/models/action.enum';
import { Model } from './models/model.model';
import { CreateModelDto } from './dtos/create.model.dto';
import { ModelsService } from './models.service';
import { DeleteResult } from 'typeorm';
import { UpdateModelDto } from './dtos/update.model.dto';
import { DeleteReasons } from '../enums/delete-reasons.enum';
import { Product } from '../products/models/product.model';

@Controller('models')
export class ModelsController {
    constructor(private modelsService: ModelsService) { }

    @Post('create')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Model))
    async create(
        @Body() createModelDto: CreateModelDto
    ): Promise<Model> {
        return await this.modelsService.create(createModelDto);
    }

    @Get('all')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Model))
    async findAll(): Promise<Model[]> {
        return await this.modelsService.findAll();
    }

    @Get('by-id/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Model))
    async findOne(
        @Param('id') id: number,
    ): Promise<Model> {
        return await this.modelsService.findOne(id);
    }

    @Get('all-deleted')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.ReadDeleted, Model))
    async findAllDeleted(): Promise<Model[]> {
        return await this.modelsService.findAllDeleted();
    }

    @Get('by-id-deleted/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.ReadDeleted, Model))
    async findOneDeleted(
        @Param('id') id: number,
    ): Promise<Model> {
        return await this.modelsService.findOneDeleted(id);
    }

    @Put('update/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Model))
    async update(
        @Param('id') id: number,
        @Body() updateModelDto: UpdateModelDto
    ): Promise<Model> {
        return await this.modelsService.update(id, updateModelDto);
    }

    @Delete('delete')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Model))
    async delete(
        @Query('ids') ids: number[],
        @Query('deleteReason') deleteReason: DeleteReasons = DeleteReasons.Manual
    ): Promise<Model[]> {
        return this.modelsService.remove(ids, deleteReason);
    }

    @Put('restore')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
    async restore(
        @Query('ids') ids: number[],
        @Query('deleteAll') deleteAll: boolean = false,
        @Query('deleteReason') deleteReason: DeleteReasons = DeleteReasons.Manual
    ): Promise<Model[]> {
        return await this.modelsService.restore(ids, deleteAll, deleteReason);
    }
}
