import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class QueryFilterDto {

    @IsString()
    @MinLength(1)
    @IsOptional()
    select?: string;

    @IsString()
    @MinLength(1)
    @IsOptional()
    sort?: string;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @IsOptional()
    page?: number;


}