import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class SignInDto {
    @IsEmail()
    email!: string;

    @IsStrongPassword()
    @IsNotEmpty()
    password!: string;
}
