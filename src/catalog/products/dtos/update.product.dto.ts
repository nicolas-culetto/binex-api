import { IsNotEmpty } from "class-validator";
import { Colors } from "src/catalog/enums/colors.enum";
import { Segments } from "src/catalog/enums/segments.enum";

export class UpdateProductDto {
    color!: Colors;
    price!: number;
    segment!: Segments;
    modelId!: number;
    imagesIndex!: number[];
}