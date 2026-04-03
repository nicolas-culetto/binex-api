import { IsEmail, IsNotEmpty } from "class-validator";

export class GetUserDto {
    id: number;

    @IsEmail()
    email:string;

    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;

    isAdmin: boolean;
}