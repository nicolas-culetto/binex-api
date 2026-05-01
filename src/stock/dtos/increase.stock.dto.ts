import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class IncreaseStockDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount!: number;
}