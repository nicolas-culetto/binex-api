import { Type } from "class-transformer";
import { IsBoolean, isEnum, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Categories } from "src/catalog/enums/categories.enum";
import { Colors } from "src/catalog/enums/colors.enum";
import { Segments } from "src/catalog/enums/segments.enum";

export class QueryFiltersDto {
    @IsOptional()
    @IsEnum(Colors)
    color?: Colors;

    @IsOptional()
    @IsEnum(Segments)
    segment?: Segments;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    discount?: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    minPrice?: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    maxPrice?: number;

    @IsOptional()
    @IsString()
    modelName?: string;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    brandId?: number;

    @IsOptional()
    @IsEnum(Categories)
    category?: Categories;

    @Type(() => Boolean)
    @IsOptional()
    @IsBoolean()
    offert?: boolean;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    page: number = 0;
}