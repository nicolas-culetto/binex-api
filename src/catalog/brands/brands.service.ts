import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './models/brand.model';
import { CreateBrandDto } from './dtos/create.brand.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateBrandDto } from './dtos/update.brand.dto';

@Injectable()
export class BrandsService {
    constructor(
        @InjectRepository(Brand)
        private brandsRepository: Repository<Brand>,
        private cloudinaryService: CloudinaryService
    ) { }

    public async create(createBrandDto: CreateBrandDto, brandImg: Express.Multer.File): Promise<Brand> {
        // validate
        const validate = await this.brandsRepository.findOneBy({name: createBrandDto.name});
        if(validate) throw new ConflictException;

        // upload brand image
        const logoFileName = `logo_${createBrandDto.name.toLowerCase()}`;
        const logoUrl = await this.cloudinaryService.uploadFile(brandImg, "brands", logoFileName);
        createBrandDto["logoUrl"] = logoUrl;

        const newBrand = this.brandsRepository.create(createBrandDto);

        return this.brandsRepository.save(newBrand);
    }

        public async findAll(): Promise<Brand[]> {
        return await this.brandsRepository.find();
    }

    public async findOne(id: number): Promise<Brand> {
        const brand = await this.brandsRepository.findOneBy({id});

        if(!brand) throw new NotFoundException;

        return brand;
    }

    public async update(id: number, updateBrandDto: UpdateBrandDto, newLogo: Express.Multer.File | null): Promise<Brand>{
        // validate
        const brand = await this.findOne(id);

        if(!brand){
            throw new NotFoundException;
        }

        if(newLogo){
            // upload brand image
            const logoFileName = `logo_${updateBrandDto.name.toLowerCase()}`;
            brand.logoUrl = await this.cloudinaryService.uploadFile(newLogo, "brands", logoFileName);
        }

        if(updateBrandDto.name){
            brand.name = updateBrandDto.name;
        }

        return this.brandsRepository.save(brand);
    }

    public async remove(id: number): Promise<DeleteResult>{
        return this.brandsRepository.delete(id);
    }
}
