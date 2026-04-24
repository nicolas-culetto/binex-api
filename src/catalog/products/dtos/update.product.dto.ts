import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { Colors } from "src/catalog/enums/colors.enum";

export class UpdateProductDto {
    @IsOptional()
    @IsEnum(Colors)
    color?: Colors;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    price?: number;

    
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    discount?: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    modelSegmentId?: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    imagesIndex!: number[];
}