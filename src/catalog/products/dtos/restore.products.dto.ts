import { Type } from 'class-transformer';
import { IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';

export class RestoreProductsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    ids!: number[];
}