import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Segments } from "src/catalog/enums/segments.enum";

export class CreateSizeDto {
    @IsNotEmpty()
    @IsEnum(Segments)
    segment!: Segments;

    @IsNotEmpty()
    @IsNumber()
    brandId!: number;

    @IsNotEmpty()
    @IsNumber()
    cm!: number;

    @IsNotEmpty()
    @IsNumber()
    eu!: number;

    @IsNotEmpty()
    @IsString()
    us!: string;

    @IsNotEmpty()
    @IsString()
    uk!: string;
}