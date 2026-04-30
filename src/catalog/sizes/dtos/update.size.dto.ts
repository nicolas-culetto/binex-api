import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Segments } from "src/catalog/enums/segments.enum";

export class UpdateSizeDto {
    @IsOptional()
    @IsNumber()
    cm?: number;

    @IsOptional()
    @IsNumber()
    eu?: number;

    @IsOptional()
    @IsString()
    us?: string;

    @IsOptional()
    @IsString()
    uk?: string;
}