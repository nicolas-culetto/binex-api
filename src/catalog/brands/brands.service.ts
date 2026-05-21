import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Brand } from './models/brand.model';
import { CreateBrandDto } from './dtos/create.brand.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateBrandDto } from './dtos/update.brand.dto';
import { Categories } from '../enums/categories.enum';
import { LoggerService } from 'src/logger/logger.service';
import { ModelsService } from '../models/models.service';

@Injectable()
export class BrandsService {

    constructor(
        @InjectRepository(Brand)
        private brandsRepository: Repository<Brand>,
        private cloudinaryService: CloudinaryService,
        private loggerService: LoggerService,
        private modelsService: ModelsService
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

    public async findAll(): Promise<Brand[]> {
        return await this.brandsRepository.find();
    }

    public async findOne(id: number): Promise<Brand> {
        const brand = await this.brandsRepository.findOneBy({ id });

        if (!brand) throw new NotFoundException("Brand not found");

        return brand;
    }

    public async findAllDeleted(): Promise<Brand[]> {
        return await this.brandsRepository.find({
            where: { deletedAt: Not(IsNull()) },
            withDeleted: true
        });
    }

    public async findOneDeleted(id: number): Promise<Brand> {
        const brand = await this.brandsRepository.findOne({
            where: { id, deletedAt: Not(IsNull()) },
            withDeleted: true
        });

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

    public async remove(id: number): Promise<Brand> {
        const deletedBrand = await this.findOne(id);
        const result = await this.brandsRepository.softRemove(deletedBrand);

        // cascade remove
        await this.modelsService.handleModelDeleted(deletedBrand);

        // logger
        this.loggerService.deleteOne(result);
        return result;
    }

    public async restore(id: number, deleteAll: boolean = false): Promise<Brand> {
        await this.brandsRepository.restore({ id });
        const restoredBrand = await this.findOne(id);

        // cascade restore
        await this.modelsService.handleModelRestored(restoredBrand, deleteAll);

        // logger
        this.loggerService.restoreOne(restoredBrand, deleteAll);

        return restoredBrand;
    }

    public async uploadData(data: any[]): Promise<void> {
        await this.brandsRepository.insert(data);
    }
}
