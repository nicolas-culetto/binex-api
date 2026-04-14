import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { Segments } from "src/catalog/enums/segments.enum";

export class CreateModelSegmentDto {
    @IsNotEmpty()
    @IsNumber()
    modelId!: number;

    @IsNotEmpty()
    @IsEnum(Segments)
    segment!: Segments;
}