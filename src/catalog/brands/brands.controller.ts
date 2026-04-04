import { Body, Controller, Delete, Get, Param, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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

@Controller('brands')
export class BrandsController {
    constructor(private brandService: BrandsService) {}

    @Post('create')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Brand))
    async create(@Body() createBrandDto: CreateBrandDto, @UploadedFile() file: Express.Multer.File): Promise<Brand>{
        return await this.brandService.create(createBrandDto, file);
    }

    @Put('update/:id')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Brand))
    async update(@Param('id') id: number, @Body() updateBrandDto: UpdateBrandDto, @UploadedFile() file: Express.Multer.File): Promise<Brand>{
        return await this.brandService.update(id, updateBrandDto, file);
    }

    @Get('all')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Brand))
    async findAll(): Promise<Brand[]> {
        return await this.brandService.findAll();
    }

    @Get('by-id/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Brand))
    async findOne(@Param('id') id: number): Promise<Brand> {
        return await this.brandService.findOne(id);
    }

    
    @Delete('delete/:id')
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Brand))
    async delete(@Param('id') id: number): Promise<DeleteResult>{
        return await this.brandService.remove(id);
    }
}
