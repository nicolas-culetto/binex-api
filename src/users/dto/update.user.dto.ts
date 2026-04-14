import { IsOptional, IsString, isStrongPassword, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(12)
    @IsOptional()
    firstName?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(12)
    @IsOptional()
    lastName?: string;
}