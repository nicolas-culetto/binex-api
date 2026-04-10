import { IsArray, IsNumber, ArrayNotEmpty } from "class-validator";

export class RestoreModelsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    ids!: number[];
}