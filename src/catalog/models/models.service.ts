import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from './models/model.model';
import { In, Repository } from 'typeorm';
import { CreateModelDto } from './dtos/create.model.dto';
import { BrandsService } from '../brands/brands.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateModelDto } from './dtos/update.model.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DeleteReasons } from '../enums/delete-reasons.enum';
import { Brand } from '../brands/models/brand.model';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class ModelsService {

    constructor(
        @InjectRepository(Model)
        private modelsRepository: Repository<Model>,
        private brandService: BrandsService,
        private eventEmitter: EventEmitter2,
        private loggerService: LoggerService
    ) { }

    public async create(createModelDto: CreateModelDto): Promise<Model> {
        const validate = await this.modelsRepository.findOneBy({ name: createModelDto.name });

        if (validate) {
            throw new ConflictException({
                message: "Model already exists",
                id: validate.id,
                canRestore: !validate.isActive
            });
        }

        // set brand
        const brand = await this.brandService.findOne(createModelDto.brandId);
        const newModel = this.modelsRepository.create({ brand, ...createModelDto });

        const result = await this.modelsRepository.save(newModel);

        // logger
        this.loggerService.create(result);

        return result;
    }

    public async findAll(isActive: boolean = true): Promise<Model[]> {
        return await this.modelsRepository.find({ where: { isActive }, relations: ['brand'] });
    }

    public async findOne(id: number, isActive: boolean = true): Promise<Model> {
        const model = await this.modelsRepository.findOne({ where: { id, isActive }, relations: ['brand'] });

        if (!model) throw new NotFoundException("Model not found");

        return model;
    }

    public async update(id: number, updateModelDto: UpdateModelDto): Promise<Model> {
        const model = await this.findOne(id);
        const prev = structuredClone(model);

        if (updateModelDto.brandId) {
            const brand = await this.brandService.findOne(updateModelDto.brandId);
            updateModelDto["brand"] = brand;
        }

        const updatedModel = Object.assign(model, updateModelDto);
        const result = await this.modelsRepository.save(updatedModel);

        // logger
        this.loggerService.update(prev, result);
        return result;
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

        // logger
        this.loggerService.deleteMany(result, deleteReason);
        return { affected: result.length, raw: [] };
    }

    private async removePermanently(ids: number[]): Promise<DeleteResult> {
        const models = await this.modelsRepository.findBy({id: In(ids)});

        // logger
        this.loggerService.deletePermanentlyMany(models);
        
        const result = await this.modelsRepository.remove(models);
        return {affected: result.length, raw: []};
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
        const result = await this.modelsRepository.save(restoredModels);

        // emit event to delete model-segments with the recovered model
        this.eventEmitter.emit('model.restored', restoredModels, deleteAll);

        // logger
        this.loggerService.restoreMany(result, deleteAll, deleteReason);
        return true;
    }

    @OnEvent('brand.deleted')
    async handleModelDeleted(deletedBrand: Brand) {
        const modelsIds = await this.getIdsByBrand(deletedBrand);
        this.remove(modelsIds, DeleteReasons.Cascade);
    }

    @OnEvent('brand.restored')
    async handleModelRestored(restoredBrand: Brand, deleteAll: boolean = false) {
        const modelsIds = await this.getIdsByBrand(restoredBrand);

        if (deleteAll) {
            this.removePermanently(modelsIds);
        } else {
            this.restore(modelsIds, false, DeleteReasons.Cascade);
        }
    }

    private async getIdsByBrand(brand: Brand): Promise<number[]> {
        const models = await this.modelsRepository.createQueryBuilder("models")
        .innerJoinAndSelect("models.brand", "brand")
        .where("brand.id = :brandId", {brandId: brand.id})
        .getMany();

        return models.map(model => model.id);
    }
}
