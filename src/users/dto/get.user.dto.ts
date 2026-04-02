import { IsEmail, IsNotEmpty } from "class-validator";

export class GetUserDto {
    @IsEmail()
    email:string;

    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;
}