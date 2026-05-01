import { IsOptional } from "class-validator";

export class FiltersStockDto {
    @IsOptional()
    minAmount?: number;

    @IsOptional()
    maxAmount?: number;

    @IsOptional()
    soldOut?: boolean;
}