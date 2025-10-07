import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateSupportDTO {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsString()
    phone: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    message: string;
}


