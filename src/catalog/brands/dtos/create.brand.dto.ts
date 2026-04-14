import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";

export class CreateBrandDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(10)
    name!: string;
}