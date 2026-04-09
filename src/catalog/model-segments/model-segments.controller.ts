import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ModelSegmentsService } from './model-segments.service';
import { PoliciesGuard } from 'src/casl/guards/policies/policies.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/casl/models/action.enum';
import { ModelSegment } from './models/model-segment.model';
import { CreateModelSegmentDto } from './dtos/create.model-segment.dto';
import { DeleteResult } from 'typeorm';
import { DeleteReasons } from '../enums/delete-reasons.enum';

@Controller('model-segments')
export class ModelSegmentsController {
    constructor(
        private modelSegmentsService: ModelSegmentsService
    ) {}

    @Post('create')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, ModelSegment))
    async create(
        @Body() modelSegmentDto: CreateModelSegmentDto
    ): Promise<ModelSegment> {
        return await this.modelSegmentsService.create(modelSegmentDto);
    }

    @Get('all')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, ModelSegment))
    async findAll(
        @Query('isActive') isActive: boolean = true
    ): Promise<ModelSegment[]> {
        return await this.modelSegmentsService.findAll(isActive);
    }

    @Get('by-id/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, ModelSegment))
    async findOne(
        @Param('id') id: number, 
        @Query('isActive') isActive: boolean = true
    ): Promise<ModelSegment> {
        return await this.modelSegmentsService.findOne(id, isActive);
    }

    @Delete('delete/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, ModelSegment))
    async remove(
        @Param('id') id: number, 
        @Query('deleteReason') deleteReason: DeleteReasons = DeleteReasons.Manual
    ): Promise<DeleteResult> {
        return await this.modelSegmentsService.remove(id, deleteReason);
    }

    @Put('restore/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, ModelSegment))
    async restore(
        @Param('id') id: number, 
        @Query('deleteAll') deleteAll: boolean = false, 
        @Query('deleteReason') deleteReason: DeleteReasons = DeleteReasons.Manual
    ): Promise<boolean> {
        return await this.modelSegmentsService.restore(id, deleteAll, deleteReason);
    }
}
