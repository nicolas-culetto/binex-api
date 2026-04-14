import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './models/brand.model';
import { CreateBrandDto } from './dtos/create.brand.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateBrandDto } from './dtos/update.brand.dto';
import { Categories } from '../enums/categories.enum';
import { EventEmitter2 } from 'eventemitter2';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class BrandsService {

    constructor(
        @InjectRepository(Brand)
        private brandsRepository: Repository<Brand>,
        private cloudinaryService: CloudinaryService,
        private eventEmitter: EventEmitter2,
        private loggerService: LoggerService
    ) { }

    public async create(createBrandDto: CreateBrandDto, brandImg: Express.Multer.File): Promise<Brand> {
        // validate
        const validate = await this.brandsRepository.findOneBy({ name: createBrandDto.name });
        if (validate) throw new ConflictException("Brand already exists");

        // upload brand image
        const logoFileName = `logo_${createBrandDto.name.toLowerCase()}`;
        const logoUrl = await this.cloudinaryService.uploadFile(brandImg, "brands", logoFileName);
        createBrandDto["logoUrl"] = logoUrl;

        const newBrand = this.brandsRepository.create(createBrandDto);
        const result = await this.brandsRepository.save(newBrand);

        // logger
        this.loggerService.create(result);
        return result;
    }

    public async findAll(isActive: boolean = true): Promise<Brand[]> {
        return await this.brandsRepository.find({where: { isActive }});
    }

    public async findOne(id: number, isActive: boolean = true): Promise<Brand> {
        const brand = await this.brandsRepository.findOneBy({ id, isActive });

        if (!brand) throw new NotFoundException("Brand not found");

        return brand;
    }

    public async findCategories(id: number): Promise<Categories[]> {
        const result = await this.brandsRepository.createQueryBuilder('brand')
            .leftJoin('brand.models', 'model')
            .where({ id })
            .select('DISTINCT model.category', 'category')
            .getRawMany();

        return result.map(item => item.category);
    }

    public async update(id: number, updateBrandDto: UpdateBrandDto, newLogo: Express.Multer.File | null): Promise<Brand> {
        // validate
        const brand = await this.findOne(id);
        const prev = structuredClone(brand);

        if (newLogo) {
            // upload brand image
            const logoFileName = `logo_${updateBrandDto.name.toLowerCase()}`;
            brand.logoUrl = await this.cloudinaryService.uploadFile(newLogo, "brands", logoFileName);
        }

        if (updateBrandDto.name) {
            brand.name = updateBrandDto.name;
        }

        const result = await this.brandsRepository.save(brand);

        // logger
        this.loggerService.update(prev, result);
        return result;
    }

    public async remove(id: number): Promise<DeleteResult> {
        const deletedBrand = await this.findOne(id);

        // change state to inactive
        deletedBrand.isActive = false;
        const result = await this.brandsRepository.save(deletedBrand);

        // emit event to delete models with the deleted brand
        this.eventEmitter.emit('brand.deleted', deletedBrand);

        // logger
        this.loggerService.deleteOne(result);
        return { affected: result? 1 : 0, raw: [] };
    }

    public async restore(id: number, deleteAll: boolean = false): Promise<boolean> {
        const restoredBrand = await this.brandsRepository.findOneBy({ id, isActive: false});

        if (!restoredBrand) throw new NotFoundException("Brand not found");

        // change state to active
        restoredBrand.isActive = true;
        const result = await this.brandsRepository.save(restoredBrand);

        // emit event to delete modelswith the recovered brand
        this.eventEmitter.emit('brand.restored', restoredBrand, deleteAll);

        // logger
        this.loggerService.restoreOne(result, deleteAll);
        return true;
    }
}
