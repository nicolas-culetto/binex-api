import { Body, Controller, Delete, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ModelSegmentsService } from './model-segments.service';
import { PoliciesGuard } from 'src/casl/guards/policies/policies.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/casl/models/action.enum';
import { ModelSegment } from './models/model-segment.model';
import { CreateModelSegmentDto } from './dtos/create.model-segment.dto';

@Controller('model-segments')
export class ModelSegmentsController {
    constructor(
        private modelSegmentsService: ModelSegmentsService
    ) {}

    @Post('create')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, ModelSegment))
    async create(@Body() modelSegmentDto: CreateModelSegmentDto): Promise<ModelSegment> {
        return await this.modelSegmentsService.create(modelSegmentDto);
    }

    @Get('all')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, ModelSegment))
    async findAll(): Promise<ModelSegment[]> {
        return await this.modelSegmentsService.findAll();
    }

    @Get('by-id/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, ModelSegment))
    async findOne(@Body('id') id: number): Promise<ModelSegment> {
        return await this.modelSegmentsService.findOne(id);
    }

    @Delete('delete/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, ModelSegment))
    async remove(@Body('id') id: number): Promise<void> {
        await this.modelSegmentsService.remove(id);
    }
}
