import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create.product.dto';
import { Product } from './models/product.model';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateProductDto } from './dtos/update.product.dto';
import { ModelSegmentsService } from '../model-segments/model-segments.service';
import { UpdateResult } from 'typeorm/browser';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ModelSegment } from '../model-segments/models/model-segment.model';
import { DeleteReasons } from '../enums/delete-reasons.enum';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private modelSegmentService: ModelSegmentsService,
        private cloudinaryService: CloudinaryService,
    ) { }

    public async create(createProductDto: CreateProductDto, productImgs: Express.Multer.File[]): Promise<Product> {
        // get model
        const modelSegment = await this.modelSegmentService.findOne(createProductDto.modelSegmentId);
        createProductDto['modelSegment'] = modelSegment;

        // save product to get Id for cloudinary path
        const newProduct = await this.productsRepository.create(createProductDto);
        await this.productsRepository.save(newProduct)

        // load images
        const productImages = await Promise.all(productImgs.map(async (img, index) => {
            const path = `products/${newProduct.id}/`
            const name = `product_${newProduct.id}_${index}`
            return await this.cloudinaryService.uploadFile(img, path, name);
        }));

        newProduct.images_url = productImages;

        return await this.productsRepository.save(newProduct);
    }

    public async findAll(isActive: boolean = true): Promise<Product[]> {
        return await this.productsRepository.find({ where: { isActive }, relations: ['modelSegment', 'modelSegment.model', 'modelSegment.model.brand'] });
    }

    public async findOne(id: number, isActive: boolean = true): Promise<Product> {
        const product = await this.productsRepository.findOne({ where: { id, isActive }, relations: ['modelSegment', 'modelSegment.model', 'modelSegment.model.brand'] });

        if (!product) throw new NotFoundException("Product not found");

        return product;
    }

    public async update(id: number, updateProductDto: UpdateProductDto, newImages: Express.Multer.File[] = []): Promise<Product> {
        const product = await this.findOne(id);

        if (newImages.length > 0) {
            this.updateImages(product, newImages, updateProductDto.imagesIndex);
        }

        if (updateProductDto.modelSegmentId) {
            const modelSegment = await this.modelSegmentService.findOne(updateProductDto.modelSegmentId);
            product.modelSegment = modelSegment;
        }

        const updatedProduct = { ...product, ...updateProductDto };
        return await this.productsRepository.save(updatedProduct);
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

    public async remove(ids: number[], deleteReason: DeleteReasons = DeleteReasons.Manual): Promise<DeleteResult> {
        const deletedProducts = await this.productsRepository.findBy({id: In(ids)});

        deletedProducts.forEach(product => {
            product.isActive = false;
            product.deleteReason = deleteReason;
        });
        const result = await this.productsRepository.save(deletedProducts);
        return { affected: result.length, raw: [] };
    }

    private async removePermanently(ids: number[]): Promise<DeleteResult> {
        const products = await this.productsRepository.findBy({id: In(ids)})

        // delete images from cloudinary
        await Promise.all(products.map(async product => {
            // for each product remove its images
            await Promise.all(product.images_url.map(async img => {
                await this.cloudinaryService.removeFile(img);
            }))
        }))

        const result = await this.productsRepository.remove(products);

        return {affected: result.length, raw: []};
    }

    public async restore(ids: number[], deleteReason: DeleteReasons = DeleteReasons.Manual): Promise<boolean> {
        const deletedProducts = await this.productsRepository.findBy({id: In(ids), isActive: false, deleteReason});
        deletedProducts.forEach(product => {
            product.isActive = true;
            product.deleteReason = DeleteReasons.None;
        });
        const result = await this.productsRepository.save(deletedProducts);
        return  result.length > 0;
    }  
    
    @OnEvent('modelSegment.deleted')
    async handleModelSegmentDeleted(deletedModelSegments: ModelSegment) {
        const productsIds = await this.getIdsByModelSegment(deletedModelSegments);
        this.remove(productsIds, DeleteReasons.Cascade);
    }

    @OnEvent('modelSegment.restored')
    async handleModelSegmentRestored(restoredModelSegments: ModelSegment, deleteAll: boolean = false) {
        const productsIds = await this.getIdsByModelSegment(restoredModelSegments);

        if(deleteAll) {
            this.removePermanently(productsIds);
        } else {    
            this.restore(productsIds, DeleteReasons.Cascade);
        }
    }

    private async getIdsByModelSegment(modelSegment: ModelSegment): Promise<number[]> {
        const products = await this.productsRepository.findBy({ modelSegment });
        return products.map(product => product.id);
    }
}
