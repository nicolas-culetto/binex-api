import { IsNotEmpty } from "class-validator";
import { Categories } from "src/catalog/enums/categories.enum";

export class CreateModelDto{
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    category: Categories

    @IsNotEmpty()
    brandId: number
}