import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email!:string;

    @IsStrongPassword()
    @IsNotEmpty()
    password!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(12)
    firstName!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(12)
    lastName!: string;
}