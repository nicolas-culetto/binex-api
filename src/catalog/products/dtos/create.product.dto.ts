import { IsNotEmpty } from "class-validator";
import { Colors } from "src/catalog/enums/colors.enum";
import { Segments } from "src/catalog/enums/segments.enum";

export class CreateProductDto {
    @IsNotEmpty()
    color!: Colors;

    @IsNotEmpty()
    price!: number;

    @IsNotEmpty()
    segment!: Segments;

    @IsNotEmpty()
    modelId!: number;
}