import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateShippingDTO {
    @IsNumber()
    @IsPositive()
    @Min(0)
    price: number;

    @IsString()
    @IsNotEmpty()
    government: string;
}


