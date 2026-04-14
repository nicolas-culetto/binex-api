import { isEnum, IsNotEmpty } from "class-validator";
import { Segments } from "src/catalog/enums/segments.enum";

export class CreateModelSegmentDto {
    @IsNotEmpty()
    modelId!: number;

    @IsNotEmpty()
    segment!: Segments;
}