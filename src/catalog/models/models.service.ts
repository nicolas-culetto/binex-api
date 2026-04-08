import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from './models/model.model';
import { Repository } from 'typeorm';
import { CreateModelDto} from './dtos/create.model.dto';
import { BrandsService } from '../brands/brands.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateModelDto } from './dtos/update.model.dto';

@Injectable()
export class ModelsService {
    constructor(
        @InjectRepository(Model)
        private modelsRepository: Repository<Model>,
        private brandService: BrandsService
    ) {}

    public async create(createModelDto: CreateModelDto): Promise<Model> {
        const validate = await this.modelsRepository.existsBy({name: createModelDto.name});
        if(validate) {
            throw new ConflictException;
        }

        const brand = await this.brandService.findOne(createModelDto.brandId);

        const newModel = this.modelsRepository.create({brand, ...createModelDto});
        return this.modelsRepository.save(newModel);
    }

    public async findAll(): Promise<Model[]> {
        return await this.modelsRepository.find({relations: ['brand']});
    }

    public async findOne(id: number): Promise<Model> {
        const model = await this.modelsRepository.findOne({where: {id}, relations: ['brand']});

        if(!model) throw new NotFoundException;

        return model;
    }

    public async update(id: number, updateModelDto: UpdateModelDto): Promise<Model> {
        const model = await this.modelsRepository.findOneBy({id});

        if(!model) throw new NotFoundException;

        if(updateModelDto.brandId){
            const brand = await this.brandService.findOne(updateModelDto.brandId);
            updateModelDto["brand"] = brand;
        }

        const updatedModel = {...model, ...updateModelDto};
        return await this.modelsRepository.save(updatedModel);
    }

    public async remove(id: number): Promise<DeleteResult> {
        return await this.modelsRepository.delete({id});
    }
}
