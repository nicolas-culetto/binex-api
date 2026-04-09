import { Colors } from "src/catalog/enums/colors.enum";

export class UpdateProductDto {
    color!: Colors;
    price!: number;
    modelSegmentId!: number;
    imagesIndex!: number[];
}