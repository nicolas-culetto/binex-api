import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from './models/model.model';
import { In, Repository } from 'typeorm';
import { CreateModelDto } from './dtos/create.model.dto';
import { BrandsService } from '../brands/brands.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateModelDto } from './dtos/update.model.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteReasons } from '../enums/delete-reasons.enum';

@Injectable()
export class ModelsService {
    constructor(
        @InjectRepository(Model)
        private modelsRepository: Repository<Model>,
        private brandService: BrandsService,
        private eventEmitter: EventEmitter2
    ) { }

    public async create(createModelDto: CreateModelDto): Promise<Model> {
        const validate = await this.modelsRepository.findOneBy({ name: createModelDto.name });
        
        if (validate) {
            throw new ConflictException({
                id: validate.id,
                canRestore: !validate.isActive
            });
        }

        const brand = await this.brandService.findOne(createModelDto.brandId);

        const newModel = this.modelsRepository.create({ brand, ...createModelDto });
        return this.modelsRepository.save(newModel);
    }

    public async findAll(isActive: boolean = true): Promise<Model[]> {
        return await this.modelsRepository.find({ where: { isActive }, relations: ['brand'] });
    }

    public async findOne(id: number, isActive: boolean = true): Promise<Model> {
        const model = await this.modelsRepository.findOne({ where: { id, isActive }, relations: ['brand'] });

        if (!model) throw new NotFoundException;

        return model;
    }

    public async update(id: number, updateModelDto: UpdateModelDto): Promise<Model> {
        const model = await this.modelsRepository.findOneBy({ id });

        if (!model) throw new NotFoundException;

        if (updateModelDto.brandId) {
            const brand = await this.brandService.findOne(updateModelDto.brandId);
            updateModelDto["brand"] = brand;
        }

        const updatedModel = { ...model, ...updateModelDto };
        return await this.modelsRepository.save(updatedModel);
    }

    public async remove(
        ids: number[],
        deleteReason: DeleteReasons = DeleteReasons.None
    ): Promise<DeleteResult> {
        const deletedModels = await this.modelsRepository.findBy({ id: In(ids) });

        // change states to inactive
        deletedModels.forEach(model => {
            model.isActive = false;
            model.deleteReason = deleteReason;
        });
        const result = await this.modelsRepository.save(deletedModels);

        // emit event to delete model-segments with the deleted model
        this.eventEmitter.emit('model.deleted', result);
        return { affected: result.length, raw: [] };
    }

    public async restore(
        ids: number[],
        deleteAll: Boolean = false,
        deleteReason: DeleteReasons = DeleteReasons.None
    ): Promise<boolean> {
        const restoredModels = await this.modelsRepository.findBy({ id: In(ids), isActive: false, deleteReason });
        
        // change state to active
        restoredModels.forEach(model => {
            model.isActive = true;
            model.deleteReason = DeleteReasons.None;
        });
        await this.modelsRepository.save(restoredModels);

        // emit event to delete model-segments with the recovered model
        this.eventEmitter.emit('model.restored', restoredModels, deleteAll);
        return true;
    }
}
