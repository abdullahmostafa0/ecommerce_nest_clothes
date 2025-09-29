import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateSupportDTO {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsString()
    @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
    phone: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    message: string;
}


