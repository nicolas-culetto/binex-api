import { IsArray, IsNumber, ArrayNotEmpty } from "class-validator";

export class DeleteModelsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    ids!: number[];
}