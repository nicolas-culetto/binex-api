import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator";
import { Categories } from "src/catalog/enums/categories.enum";

export class CreateModelDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(20)
    name!: string;

    @IsNotEmpty()
    @IsEnum(Categories)
    category!: Categories

    @IsNotEmpty()
    @IsNumber()
    brandId!: number
}