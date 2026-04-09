import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelSegment } from './models/model-segment.model';
import { Repository } from 'typeorm';
import { CreateModelSegmentDto } from './dtos/create.model-segment.dto';
import { ModelsService } from '../models/models.service';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class ModelSegmentsService {
    constructor(
        @InjectRepository(ModelSegment)
        private modelSegmentsRepository: Repository<ModelSegment>,
        private modelService: ModelsService
    )  {}

    public async create(modelSegmentDto: CreateModelSegmentDto): Promise<ModelSegment> {
        const validate = await this.modelSegmentsRepository.existsBy({model: {id: modelSegmentDto.modelId}, segment: modelSegmentDto.segment});
        
        if (validate) {
            throw new ConflictException;
        }

        const model = await this.modelService.findOne(modelSegmentDto.modelId);

        const newModelSegment = this.modelSegmentsRepository.create({model, ...modelSegmentDto});
        return this.modelSegmentsRepository.save(newModelSegment);
    }

    public async findAll(): Promise<ModelSegment[]> {
        return await this.modelSegmentsRepository.find({relations: ['model']});
    }

    public async findOne(id: number): Promise<ModelSegment> {
        const modelSegment = await this.modelSegmentsRepository.findOne({where: {id}, relations: ['model']});

        if(!modelSegment) throw new NotFoundException;

        return modelSegment;
    }

    public async remove(id: number): Promise<DeleteResult> {
        return await this.modelSegmentsRepository.delete({ id });
    }
}
