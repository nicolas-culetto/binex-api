import { IsNotEmpty } from "class-validator";
import { Categories } from "src/catalog/enums/categories.enum";

export class UpdateModelDto{
    name: string;
    category: Categories
    brandId: number
}