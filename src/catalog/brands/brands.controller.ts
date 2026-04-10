import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBrandDto } from './dtos/create.brand.dto';
import { Action } from 'src/casl/models/action.enum';
import { Brand } from './models/brand.model';
import { AppAbility } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { PoliciesGuard } from 'src/casl/guards/policies/policies.guard';
import { DeleteResult } from 'typeorm';
import { UpdateBrandDto } from './dtos/update.brand.dto';
import { Categories } from '../enums/categories.enum';

@Controller('brands')
export class BrandsController {
    constructor(private brandService: BrandsService) { }

    @Post('create')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Brand))
    async create(@Body() createBrandDto: CreateBrandDto, @UploadedFile() file: Express.Multer.File): Promise<Brand> {
        return await this.brandService.create(createBrandDto, file);
    }

    @Put('update/:id')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Brand))
    async update(@Param('id') id: number, @Body() updateBrandDto: UpdateBrandDto, @UploadedFile() file: Express.Multer.File): Promise<Brand> {
        return await this.brandService.update(id, updateBrandDto, file);
    }

    @Get('all')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Brand))
    async findAll(
        @Query('isActive') isActive: boolean = true
    ): Promise<Brand[]> {
        return await this.brandService.findAll(isActive);
    }

    @Get('by-id/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Brand))
    async findOne(
        @Param('id') id: number,
        @Query('isActive') isActive: boolean = true
    ): Promise<Brand> {
        return await this.brandService.findOne(id, isActive);
    }

    @Get('categories/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Brand))
    async findCategories(@Param('id') id: number): Promise<Categories[]> {
        return await this.brandService.findCategories(id);
    }

    @Delete('delete')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Brand))
    async delete(@Query('id') id: number): Promise<DeleteResult> {
        return await this.brandService.remove(id);
    }

    @Put('restore')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Brand))
    async restore(@Query('id') id: number, @Query('deleteAll') deleteAll: boolean = false): Promise<boolean> {
        return await this.brandService.restore(id, deleteAll);
    }
}
