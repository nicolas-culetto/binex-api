import { IsEnum, IsNumber, IsString, MaxLength, MinLength, IsOptional } from "class-validator";
import { Categories } from "src/catalog/enums/categories.enum";

export class UpdateModelDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(20)
    name!: string;

    @IsOptional()
    @IsEnum(Categories)
    category!: Categories

    @IsOptional()
    @IsNumber()
    brandId!: number
}