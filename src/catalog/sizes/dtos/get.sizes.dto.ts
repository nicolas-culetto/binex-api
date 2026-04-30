import { Type } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import { Segments } from "src/catalog/enums/segments.enum";

export class GetSizesDto {
    @Type(() => Number)
    @IsNotEmpty()
    brandId!: number;

    @IsNotEmpty()
    segment!: Segments;
}