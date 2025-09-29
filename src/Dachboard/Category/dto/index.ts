import { IsNotEmpty, IsObject, IsOptional, IsString, MinLength } from "class-validator";
import { QueryFilterDto } from "src/common/Dto/query.filter.dto";

interface IImage {
    secure_url: string,
    public_id: string,
    folderId: string
}
export class CreateCategoryDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nameArabic: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nameEnglish: string

    @IsObject()
    image: IImage
}


export class UpdateCategorDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @IsOptional()
    nameArabic?: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @IsOptional()
    nameEnglish?: string

    @IsObject()
    image?: IImage
}
/*
export class CategoryFilterDTO extends QueryFilterDto {
    @IsString()
    @IsOptional()
    @MinLength(1)
    name?: string

}*/