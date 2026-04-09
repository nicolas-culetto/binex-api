import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelSegment } from './models/model-segment.model';
import { In, Repository } from 'typeorm';
import { CreateModelSegmentDto } from './dtos/create.model-segment.dto';
import { ModelsService } from '../models/models.service';
import { DeleteResult } from 'typeorm/browser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteReasons } from '../enums/delete-reasons.enum';

@Injectable()
export class ModelSegmentsService {
    constructor(
        @InjectRepository(ModelSegment)
        private modelSegmentsRepository: Repository<ModelSegment>,
        private modelService: ModelsService,
        private eventEmitter: EventEmitter2
    ) { }

    public async create(modelSegmentDto: CreateModelSegmentDto): Promise<ModelSegment> {
        const validate = await this.modelSegmentsRepository.findOneBy({ model: { id: modelSegmentDto.modelId }, segment: modelSegmentDto.segment });

        if(validate) {
            throw new ConflictException({
                id: validate.id,
                canRestore: !validate.isActive
            });
        }

        const model = await this.modelService.findOne(modelSegmentDto.modelId);

        const newModelSegment = this.modelSegmentsRepository.create({ model, ...modelSegmentDto });
        return this.modelSegmentsRepository.save(newModelSegment);
    }

    public async findAll(isActive: boolean = true): Promise<ModelSegment[]> {
        return await this.modelSegmentsRepository.find({ where: { isActive }, relations: ['model'] });
    }

    public async findOne(id: number, isActive: boolean = true): Promise<ModelSegment> {
        const modelSegment = await this.modelSegmentsRepository.findOne({ where: { id, isActive }, relations: ['model'] });

        if (!modelSegment) throw new NotFoundException;

        return modelSegment;
    }

    public async remove(id: number, deleteReason: DeleteReasons = DeleteReasons.Manual): Promise<DeleteResult> {
        const deletedModelSegment = await this.findOne(id);

        // change state to inactive
        deletedModelSegment.isActive = false;
        deletedModelSegment.deleteReason = deleteReason;
        await this.modelSegmentsRepository.save(deletedModelSegment);

        // emit event to delete products with the deleted model segment
        this.eventEmitter.emit('modelSegment.deleted', deletedModelSegment);
        return { affected: 1, raw: [] };
    }

    public async restore(id: number, deleteAll: boolean = false, deleteReason: DeleteReasons = DeleteReasons.Manual): Promise<boolean> {
        const restoredModelSegment = await this.modelSegmentsRepository.findOneBy({id, isActive: false, deleteReason});

        if(!restoredModelSegment) throw new NotFoundException;

        // change state to active
        restoredModelSegment.isActive = true;
        restoredModelSegment.deleteReason =  DeleteReasons.None;
        await this.modelSegmentsRepository.save(restoredModelSegment);

        // emit event to delete products with the deleted model segment
        this.eventEmitter.emit('modelSegment.restored', restoredModelSegment, deleteAll);
        return true;
    }
}
