import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create.product.dto';
import { Product } from './models/product.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ModelsService } from '../models/models.service';
import { DeleteResult } from 'typeorm/browser';
import { UpdateProductDto } from './dtos/update.product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private modelsService: ModelsService,
        private cloudinaryService: CloudinaryService
    ) { }

    public async create(createProductDto: CreateProductDto, productImgs: Express.Multer.File[]): Promise<Product> {
        // get model
        const model = await this.modelsService.findOne(createProductDto.modelId);
        createProductDto['model'] = model;

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

    public async findAll(): Promise<Product[]> {
        return await this.productsRepository.find({ relations: ['model', 'model.brand'] });
    }

    public async findOne(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({ where: { id }, relations: ['model', 'model.brand'] });

        if (!product) throw new NotFoundException;

        return product;
    }

    public async update(id: number, updateProductDto: UpdateProductDto, newImages: Express.Multer.File[] = []): Promise<Product> {
        const product = await this.findOne(id);

        if (newImages.length > 0) {
            this.updateImages(product, newImages, updateProductDto.imagesIndex);
        }

        if (updateProductDto.modelId) {
            const model = await this.modelsService.findOne(updateProductDto.modelId);
            product.model = model;
        }

        const updatedProduct = { ...product, ...updateProductDto };
        return await this.productsRepository.save(updatedProduct);
    }

    private async updateImages(product: Product, newImages: Express.Multer.File[], imagesIndex: number[]): Promise<void> {
        if (imagesIndex.length !== newImages.length) {
            throw new BadRequestException;
        }

        await Promise.all(newImages.map((async (img, index) => {
            const imgIndex = imagesIndex[index];
            const path = `products/${product.id}/`
            const name = `product_${product.id}_${imgIndex}`
            await this.cloudinaryService.uploadFile(img, path, name);
        })));
    }

    public async remove(id: number): Promise<DeleteResult> {
        return await this.productsRepository.delete({ id });
    }
}
