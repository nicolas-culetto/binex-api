import { IsBoolean, IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class GetUserDto {
    @IsNumber()
    @IsNotEmpty()
    id!: number;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    @IsNotEmpty()
    firstName!: string;

    @IsNotEmpty()
    @IsNotEmpty()
    lastName!: string;

    @IsBoolean()
    @IsNotEmpty()
    isAdmin!: boolean;
}