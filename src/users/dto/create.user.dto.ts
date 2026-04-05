import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email!:string;

    @IsStrongPassword()
    @IsNotEmpty()
    password!: string;

    @IsNotEmpty()
    firstName!: string;

    @IsNotEmpty()
    lastName!: string;

    isAdmin?: boolean;
}