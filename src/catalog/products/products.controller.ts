import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PoliciesGuard } from 'src/casl/guards/policies/policies.guard';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/casl/models/action.enum';
import { Product } from './models/product.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dtos/create.product.dto';
import { DeleteResult } from 'typeorm';
import { UpdateProductDto } from './dtos/update.product.dto';

@Controller('products')
export class ProductsController {
    constructor(private productService: ProductsService) {}

    @Post('create')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Product))
    @UseInterceptors(FilesInterceptor("files", 4))
    async create(@Body() createProductDto: CreateProductDto, @UploadedFiles() files: Express.Multer.File[]): Promise<Product> {
        return await this.productService.create(createProductDto, files);
    }

    @Get('all')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Product))
    async findAll(): Promise<Product[]> {
        return await this.productService.findAll();
    }

    @Get('by-id/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Product))
    async findOne(@Param('id') id: number): Promise<Product> {
        return await this.productService.findOne(id);
    }

    @Put('update/:id')
    @UseInterceptors(FilesInterceptor("files", 4))
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
    async update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto, @UploadedFiles() files: Express.Multer.File[]): Promise<Product> {
        return await this.productService.update(id, updateProductDto, files);
    }

    @Delete('delete/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Product))
    async remove(@Param('id') id: number): Promise<DeleteResult> {
        return await this.productService.remove(id);
    }
}
