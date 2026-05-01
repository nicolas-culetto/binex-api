import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStockDto {
    @IsNotEmpty()
    @IsNumber()
    productId!: number;

    @IsNotEmpty()
    @IsNumber()
    sizeId!: number;

    @IsNotEmpty()
    @IsNumber()
    amount!: number;
}