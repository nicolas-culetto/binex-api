import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create.product.dto';
import { Product } from './models/product.model';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateProductDto } from './dtos/update.product.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { ModelSegment } from '../model-segments/models/model-segment.model';
import { DeleteReasons } from '../enums/delete-reasons.enum';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private cloudinaryService: CloudinaryService,
        private loggerService: LoggerService
    ) { }

    public async create(createProductDto: CreateProductDto, productImgs: Express.Multer.File[]): Promise<Product> {
        // save product to get Id for cloudinary path
        const newProduct = await this.productsRepository.create({
            ...createProductDto,
            modelSegment: { id: createProductDto.modelSegmentId }
        });
        await this.productsRepository.save(newProduct)

        // load images
        const productImages = await Promise.all(productImgs.map(async (img, index) => {
            const path = `products/${newProduct.id}/`
            const name = `product_${newProduct.id}_${index}`
            return await this.cloudinaryService.uploadFile(img, path, name);
        }));

        newProduct.images_url = productImages;
        const result = await this.productsRepository.save(newProduct);

        // logger
        this.loggerService.create(result);
        return result;
    }

    public async findAll(): Promise<Product[]> {
        return await this.productsRepository.find({
            relations: ['modelSegment', 'modelSegment.model', 'modelSegment.model.brand']
        });
    }

    public async findOne(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['modelSegment', 'modelSegment.model', 'modelSegment.model.brand']
        });

        if (!product) throw new NotFoundException("Product not found");

        return product;
    }

    public async findAllDeleted(): Promise<Product[]> {
        return await this.productsRepository.find({
            where: { deletedAt: Not(IsNull()) },
            relations: ['modelSegment', 'modelSegment.model', 'modelSegment.model.brand'],
            withDeleted: true
        });
    }

    public async findOneDeleted(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id, deletedAt: Not(IsNull()) },
            relations: ['modelSegment', 'modelSegment.model', 'modelSegment.model.brand'],
            withDeleted: true
        });

        if (!product) throw new NotFoundException("Product not found");

        return product;
    }

    public async update(id: number, updateProductDto: UpdateProductDto, newImages: Express.Multer.File[] = []): Promise<Product> {
        const product = await this.findOne(id);

        const prev = structuredClone(product);

        if (newImages.length > 0) {
            this.updateImages(product, newImages, updateProductDto.imagesIndex);
        }

        if (updateProductDto.modelSegmentId) {
            product.modelSegment = { id: updateProductDto.modelSegmentId } as ModelSegment;
        }

        const updatedProduct = Object.assign(product, updateProductDto);
        const result = await this.productsRepository.save(updatedProduct);

        // logger
        this.loggerService.update(prev, result);
        return result;
    }

    private async updateImages(product: Product, newImages: Express.Multer.File[], imagesIndex: number[]): Promise<void> {
        if (imagesIndex.length !== newImages.length) {
            throw new BadRequestException("Files array lenght does not match index array");
        }

        await Promise.all(newImages.map((async (img, index) => {
            const imgIndex = imagesIndex[index];
            const path = `products/${product.id}/`
            const name = `product_${product.id}_${imgIndex}`
            await this.cloudinaryService.uploadFile(img, path, name);
        })));
    }

    public async remove(ids: number[], deleteReason: DeleteReasons = DeleteReasons.Manual): Promise<Product[]> {
        await this.productsRepository.update({ id: In(ids) }, { deleteReason });
        const deletedProducts = await this.productsRepository.findBy({ id: In(ids) });
        const result = await this.productsRepository.softRemove(deletedProducts);

        // logger
        this.loggerService.deleteMany(result, deleteReason);
        return result;
    }

    private async removePermanently(ids: number[]): Promise<DeleteResult> {
        const products = await this.productsRepository.find({
            where: { id: In(ids) },
            withDeleted: true
        });

        // delete images from cloudinary
        const images = products.flatMap(prod => prod.images_url);
        // for each product remove its images
        await Promise.all(images.map(async img => {
            await this.cloudinaryService.removeFile(img);
        }))

        // logger
        await this.loggerService.deletePermanentlyMany(products);

        const result = await this.productsRepository.remove(products);
        return { affected: result.length, raw: [] };
    }

    public async restore(ids: number[], deleteReason: DeleteReasons = DeleteReasons.Manual): Promise<Product[]> {
        await this.productsRepository.restore({ id: In(ids) });
        await this.productsRepository.update({ id: In(ids) }, { deleteReason: null });
        const deletedProducts = await this.productsRepository.find({
            where: { id: In(ids) }
        });

        // logger
        this.loggerService.restoreMany(deletedProducts, false, deleteReason);
        return deletedProducts;
    }

    async handleModelSegmentDeleted(deletedModelSegments: ModelSegment) {
        const productsIds = await this.getIdsByModelSegment(deletedModelSegments);
        this.remove(productsIds, DeleteReasons.Cascade);
    }

    async handleModelSegmentRestored(restoredModelSegments: ModelSegment, deleteAll: boolean = false) {
        const productsIds = await this.getIdsByModelSegment(restoredModelSegments);

        if (deleteAll) {
            await this.removePermanently(productsIds);
        } else {
            await this.restore(productsIds, DeleteReasons.Cascade);
        }
    }

    private async getIdsByModelSegment(modelSegment: ModelSegment): Promise<number[]> {
        const products = await this.productsRepository.createQueryBuilder("products")
            .withDeleted()
            .innerJoinAndSelect("products.modelSegment", "modelSegment")
            .where("modelSegment.id = :modelSegmentId", { modelSegmentId: modelSegment.id })
            .getMany();
        return products.map(product => product.id);
    }
}
