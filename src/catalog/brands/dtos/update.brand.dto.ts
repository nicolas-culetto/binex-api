import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";

export class UpdateBrandDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(10)
    name!: string;
}