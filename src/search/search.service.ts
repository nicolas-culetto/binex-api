import { Injectable } from '@nestjs/common';
import { QueryFiltersDto } from './dtos/query.filters.dto';
import { Repository } from 'typeorm';
import { ModelSegment } from 'src/catalog/model-segments/models/model-segment.model';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm/browser';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(ModelSegment)
        private modelSegmentRepository: Repository<ModelSegment>
    ) { }

    public async search(queryFiltersDto: QueryFiltersDto){
        let query = this.modelSegmentRepository.createQueryBuilder("modelSegment")
            .innerJoinAndSelect('modelSegment.model', 'model')
            .innerJoinAndSelect('modelSegment.products', 'products')
            .innerJoinAndSelect('model.brand', 'brand');

        query = this.applyFilters(query, queryFiltersDto);
        return await query.getMany();
    }

    private applyFilters(
        query: SelectQueryBuilder<ModelSegment>, 
        dto: QueryFiltersDto
    ): SelectQueryBuilder<ModelSegment>{

        if(dto.color) {
            query.andWhere(
                'products.color = :color', 
                {color: dto.color}
            );
        }

        if(dto.segment) {
            query.andWhere(
                'modelSegment.segment = :segment', 
                {segment: dto.segment}
            );
        }

        if(dto.category) {
            query.andWhere(
                'model.category = :category', 
                {category: dto.category}
            );
        }

        if(dto.modelName) {
            query.andWhere(
                'model.name ILIKE :name', 
                {name: `%${dto.modelName}%`}
            );
        }

        if(dto.brandId) {
            query.andWhere(
                'brand.id = :id', 
                {id: dto.brandId}
            );
        }
        
        if(dto.discount) {
            query.andWhere(
                'products.discount = :discount', 
                {discount: dto.discount}
            );
        }

        if(dto.offert) {
            query.andWhere(
                'products.discount > :discount', 
                {discount: 0}
            );
        }

        if(dto.minPrice){
            query.andWhere(
                'products.price >= :price', 
                {price: dto.minPrice}
            );
        }

        if(dto.maxPrice){
            query.andWhere(
                'products.price <= :price', 
                {price: dto.maxPrice}
            );
        }

        return query;
    }
}
