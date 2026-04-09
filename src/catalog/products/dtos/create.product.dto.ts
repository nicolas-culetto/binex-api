import { IsNotEmpty } from "class-validator";
import { Colors } from "src/catalog/enums/colors.enum";

export class CreateProductDto {
    @IsNotEmpty()
    color!: Colors;

    @IsNotEmpty()
    price!: number;

    @IsNotEmpty()
    modelSegmentId!: number;
}