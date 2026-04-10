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
import { DeleteModelsDto } from './dtos/delete.models.dto';
import { DeleteReasons } from '../enums/delete-reasons.enum';
import { RestoreModelsDto } from './dtos/restore.models.dot';
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
    async findAll(
        @Query('isActive') isActive: boolean = true
    ): Promise<Model[]> {
        return await this.modelsService.findAll(isActive);
    }

    @Get('by-id/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Model))
    async findOne(
        @Param('id') id: number,
        @Query('isActive') isActive: boolean = true
    ): Promise<Model> {
        return await this.modelsService.findOne(id, isActive);
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
        @Body() deleteModelDto: DeleteModelsDto,
        @Query('deleteReason') deleteReason: DeleteReasons = DeleteReasons.Manual
    ): Promise<DeleteResult> {
        return this.modelsService.remove(deleteModelDto.ids, deleteReason);
    }

    @Put('restore')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
    async restore(
        @Body() restoreModelsDto: RestoreModelsDto,
        @Query('deleteAll') deleteAll: boolean = false,
        @Query('deleteReason') deleteReason: DeleteReasons = DeleteReasons.Manual
    ): Promise<boolean> {
        return await this.modelsService.restore(restoreModelsDto.ids, deleteAll, deleteReason);
    }
}
