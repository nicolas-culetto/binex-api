import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelSegment } from './models/model-segment.model';
import { In, IsNull, Not, Repository } from 'typeorm';
import { CreateModelSegmentDto } from './dtos/create.model-segment.dto';
import { ModelsService } from '../models/models.service';
import { DeleteResult } from 'typeorm/browser';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DeleteReasons } from '../enums/delete-reasons.enum';
import { Model } from '../models/models/model.model';
import { LoggerService } from 'src/logger/logger.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ModelSegmentsService {

    constructor(
        @InjectRepository(ModelSegment)
        private modelSegmentsRepository: Repository<ModelSegment>,
        private loggerService: LoggerService,
        private productService: ProductsService
    ) { }

    public async create(modelSegmentDto: CreateModelSegmentDto): Promise<ModelSegment> {
        const validate = await this.modelSegmentsRepository.findOneBy({ model: { id: modelSegmentDto.modelId }, segment: modelSegmentDto.segment });

        if (validate) {
            throw new ConflictException({
                message: "ModelSegment already exists",
                id: validate.id,
                canRestore: validate.createdAt != null
            });
        }

        const newModelSegment = this.modelSegmentsRepository.create({ 
            model: { id: modelSegmentDto.modelId }, 
            ...modelSegmentDto 
        });
        const result = await this.modelSegmentsRepository.save(newModelSegment);

        // logger
        this.loggerService.create(result);

        return result;
    }

    public async findAll(): Promise<ModelSegment[]> {
        return await this.modelSegmentsRepository.find({ relations: ['model'] });
    }

    public async findOne(id: number): Promise<ModelSegment> {
        const modelSegment = await this.modelSegmentsRepository.findOne({ where: { id }, relations: ['model'], withDeleted: true });

        if (!modelSegment) throw new NotFoundException("ModelSegment not found");

        return modelSegment;
    }

    public async findAllDeleted(): Promise<ModelSegment[]> {
        return await this.modelSegmentsRepository.find({
            where: { deletedAt: Not(IsNull()) },
            relations: ['model'],
            withDeleted: true
        });
    }

    public async findOneDeleted(id: number): Promise<ModelSegment> {
        const modelSegment = await this.modelSegmentsRepository.findOne({
            where: { id, deletedAt: Not(IsNull()) },
            relations: ['model'],
            withDeleted: true
        });

        if (!modelSegment) throw new NotFoundException("ModelSegment not found");

        return modelSegment;
    }

    public async remove(id: number, deleteReason: DeleteReasons = DeleteReasons.Manual): Promise<ModelSegment> {
        await this.modelSegmentsRepository.update({ id }, { deleteReason });
        const deletedModelSegment = await this.findOne(id);
        const result = await this.modelSegmentsRepository.softRemove(deletedModelSegment);

        // cascade remove
        await this.productService.handleModelSegmentDeleted(deletedModelSegment);

        // logger
        this.loggerService.deleteOne(result, deleteReason);
        return result
    }

    private async removePermanently(id: number): Promise<DeleteResult> {
        const modelSegment = await this.modelSegmentsRepository.find({
            where: { id },
            withDeleted: true
        });

        // cascade remove
        await this.productService.handleModelSegmentRestored(modelSegment[0], true)

        // logger
        await this.loggerService.deletePermanentlyMany(modelSegment);

        const result = await this.modelSegmentsRepository.remove(modelSegment);
        return { affected: result ? 1 : 0, raw: [] };
    }

    public async restore(id: number, deleteAll: boolean = false, deleteReason: DeleteReasons = DeleteReasons.Manual): Promise<ModelSegment> {
        await this.modelSegmentsRepository.restore({ id });
        await this.modelSegmentsRepository.update({id}, { deleteReason: null });
        const restoredModelSegment = await this.findOne(id);

        // cascade restore
        await this.productService.handleModelSegmentRestored(restoredModelSegment, deleteAll);

        // logger
        this.loggerService.restoreOne(restoredModelSegment, deleteAll, deleteReason);
        return restoredModelSegment;
    }

    async handleModelDeleted(deletedModels: Model[]) {
        const modelSegmentsIds = await this.getIdsByModels(deletedModels);
        modelSegmentsIds.forEach(id => this.remove(id, DeleteReasons.Cascade));
    }

    async handleModelRestored(restoredModels: Model[], deleteAll: boolean = false) {
        const modelSegmentsIds = await this.getIdsByModels(restoredModels);

        if (deleteAll) {
            for(let id of modelSegmentsIds){
                await this.removePermanently(id);
            }
        } else {
            for(let id of modelSegmentsIds){
                await this.restore(id, false, DeleteReasons.Cascade);
            }
        }
    }

    private async getIdsByModels(models: Model[]): Promise<number[]> {
        const modelIds = models.map(m => m.id);

        const modelSegments = await this.modelSegmentsRepository.find({
            where: { model: In(modelIds) },
            relations: ['model'],
            withDeleted: true
        });

        return modelSegments.map(modelSegment => modelSegment.id);
    }

    public async uploadData(data: any[]): Promise<void> {
        await this.modelSegmentsRepository.insert(data);
    }
}
