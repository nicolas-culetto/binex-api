import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from './models/model.model';
import { In, IsNull, Not, Repository } from 'typeorm';
import { CreateModelDto } from './dtos/create.model.dto';
import { BrandsService } from '../brands/brands.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateModelDto } from './dtos/update.model.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DeleteReasons } from '../enums/delete-reasons.enum';
import { Brand } from '../brands/models/brand.model';
import { LoggerService } from 'src/logger/logger.service';
import { ModelSegmentsService } from '../model-segments/model-segments.service';

@Injectable()
export class ModelsService {

    constructor(
        @InjectRepository(Model)
        private modelsRepository: Repository<Model>,
        private loggerService: LoggerService,
        private modelSegmentsService: ModelSegmentsService
    ) { }

    public async create(createModelDto: CreateModelDto): Promise<Model> {
        const validate = await this.modelsRepository.findOneBy({ name: createModelDto.name });

        if (validate) {
            throw new ConflictException({
                message: "Model already exists",
                id: validate.id,
                canRestore: validate.deletedAt != null
            });
        }

        // set brand
        const newModel = this.modelsRepository.create({ brand: { id: createModelDto.brandId }, ...createModelDto });

        const result = await this.modelsRepository.save(newModel);

        // logger
        this.loggerService.create(result);

        return result;
    }

    public async findAll(): Promise<Model[]> {
        return await this.modelsRepository.find({ relations: ['brand'] });
    }

    public async findOne(id: number): Promise<Model> {
        const model = await this.modelsRepository.findOne({ where: { id }, relations: ['brand'] });

        if (!model) throw new NotFoundException("Model not found");

        return model;
    }

    public async findAllDeleted(): Promise<Model[]> {
        return await this.modelsRepository.find({
            where: { deletedAt: Not(IsNull()) },
            relations: ['brand'],
            withDeleted: true
        });
    }

    public async findOneDeleted(id: number): Promise<Model> {
        const model = await this.modelsRepository.findOne({
            where: { id, deletedAt: Not(IsNull()) },
            relations: ['brand'],
            withDeleted: true
        });

        if (!model) throw new NotFoundException("Model not found");

        return model;
    }

    public async update(id: number, updateModelDto: UpdateModelDto): Promise<Model> {
        const model = await this.findOne(id);
        const prev = structuredClone(model);

        if (updateModelDto.brandId) {
            updateModelDto["brand"] = { id: updateModelDto.brandId };
        }

        const updatedModel = Object.assign(model, updateModelDto);
        const result = await this.modelsRepository.save(updatedModel);

        // logger
        this.loggerService.update(prev, result);
        return result;
    }

    public async remove(
        ids: number[],
        deleteReason: DeleteReasons = DeleteReasons.Manual
    ): Promise<Model[]> {
        await this.modelsRepository.update({ id: In(ids) }, { deleteReason });
        const deletedModels = await this.modelsRepository.findBy({ id: In(ids) });
        const result = await this.modelsRepository.softRemove(deletedModels);

        // cascade remove
        await this.modelSegmentsService.handleModelDeleted(deletedModels);

        // logger
        this.loggerService.deleteMany(result, deleteReason);
        return result;
    }

    private async removePermanently(ids: number[]): Promise<DeleteResult> {
        const models = await this.modelsRepository.find({
            where: { id: In(ids) },
            withDeleted: true
        });

        // cascade remove
        await this.modelSegmentsService.handleModelRestored(models, true);

        // logger
        await this.loggerService.deletePermanentlyMany(models);

        const result = await this.modelsRepository.remove(models);
        return { affected: result.length, raw: [] };
    }

    public async restore(
        ids: number[],
        deleteAll: boolean = false,
        deleteReason: DeleteReasons = DeleteReasons.Manual
    ): Promise<Model[]> {
        await this.modelsRepository.restore({ id: In(ids) });
        await this.modelsRepository.update({ id: In(ids) }, { deleteReason: null });
        const restoredModels = await this.modelsRepository.findBy({
            id: In(ids),
        });

        // cascade restore
        await this.modelSegmentsService.handleModelRestored(restoredModels, deleteAll);

        // logger
        this.loggerService.restoreMany(restoredModels, deleteAll, deleteReason);
        return restoredModels;
    }

    async handleModelDeleted(deletedBrand: Brand) {
        const modelsIds = await this.getIdsByBrand(deletedBrand);
        this.remove(modelsIds, DeleteReasons.Cascade);
    }

    async handleModelRestored(restoredBrand: Brand, deleteAll: boolean = false) {
        const modelsIds = await this.getIdsByBrand(restoredBrand);

        if (deleteAll) {
            await this.removePermanently(modelsIds);
        } else {
            await this.restore(modelsIds, false, DeleteReasons.Cascade);
        }
    }

    private async getIdsByBrand(brand: Brand): Promise<number[]> {
        const models = await this.modelsRepository.createQueryBuilder("models")
            .withDeleted()
            .innerJoinAndSelect("models.brand", "brand")
            .where("brand.id = :brandId", { brandId: brand.id })
            .getMany();

        return models.map(model => model.id);
    }

    public async uploadData(data: any[]): Promise<void> {
        await this.modelsRepository.insert(data);
    }
}
