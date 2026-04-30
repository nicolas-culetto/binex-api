import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSizeDto } from './dtos/create.size.dto';
import { Size } from './models/size.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/logger/logger.service';
import { BrandsService } from '../brands/brands.service';
import { Segments } from '../enums/segments.enum';
import { GetSizesDto } from './dtos/get.sizes.dto';
import { UpdateSizeDto } from './dtos/update.size.dto';
import { DeleteResult } from 'typeorm/browser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateResult } from 'typeorm/browser';

@Injectable()
export class SizesService {
    constructor(
        @InjectRepository(Size)
        private sizeRepository: Repository<Size>,
        private logger: LoggerService,
        private brandService: BrandsService,
        private eventEmitter: EventEmitter2
    ) {}

    public async create(createSizeDto: CreateSizeDto): Promise<Size> {
        // validation
        const validation = await this.sizeRepository.existsBy({
            segment: createSizeDto.segment,
            brand: {id: createSizeDto.brandId},
            cm: createSizeDto.cm
        })

        // get brand
        const brand = await this.brandService.findOne(createSizeDto.brandId);
        createSizeDto['brand'] = brand;

        if(validation){
            throw new ConflictException("Already exist this size.")
        }

        // load new size
        const newSize = this.sizeRepository.create(createSizeDto);
        const result = await this.sizeRepository.save(newSize);

        // logger
        this.logger.create(result);
        return result;
    }

    public async getSizes(getSizesDto: GetSizesDto): Promise<Size[]> {
        const result = await this.sizeRepository.createQueryBuilder("sizes")
        .innerJoinAndSelect("sizes.brand", "brand")
        .where("brand.id = :brandId", {brandId: getSizesDto.brandId})
        .andWhere("sizes.segment = :segment", {segment: getSizesDto.segment})
        .getMany();

        return result;
    }

    public async update(id: number, updateSizeDto: UpdateSizeDto): Promise<Size> {
        const size = await this.sizeRepository.findOneBy({id});

        // validation
        if(!size){
            throw new NotFoundException("Size not found")
        }

        // load
        const prev = structuredClone(size);
        const updatedSize = Object.assign(size, updateSizeDto);
        const result = await this.sizeRepository.save(updatedSize);

        // logger
        this.logger.update(prev, result);
        
        return result;
    }

    public async remove(id: number): Promise<DeleteResult> {
        const size = await this.sizeRepository.findBy({id});

        // validation
        if(size.length == 0){
            throw new NotFoundException("Size not found")
        }

        const result = await this.sizeRepository.softRemove(size);

        // event
        this.eventEmitter.emit('size.removed', size);

        // logger
        this.logger.deleteMany(result);

        return { affected: result.length, raw: []};
    }

    public async restore(id: number): Promise<UpdateResult> {
        const result = await this.sizeRepository.restore({id});
        const restored = await this.sizeRepository.findBy({id});

        // event
        this.eventEmitter.emit('size.restored', restored);

        // logger
        this.logger.restoreMany(restored);

        return result;
    }
}
