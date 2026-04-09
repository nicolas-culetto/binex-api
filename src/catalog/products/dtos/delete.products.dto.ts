import { IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';

export class DeleteProductsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    ids!: number[];
}