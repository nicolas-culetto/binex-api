import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";


export class AdjustStockDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount!: number;
}