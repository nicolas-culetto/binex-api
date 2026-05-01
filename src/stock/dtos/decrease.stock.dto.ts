import { IsNegative, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class DecreaseStockDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount!: number;
}