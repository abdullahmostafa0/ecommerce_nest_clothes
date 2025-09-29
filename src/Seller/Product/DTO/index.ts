import { Transform, Type } from "class-transformer";
import { IsArray, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength, ValidateNested, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { Types } from "mongoose";
import { QueryFilterDto } from "src/common/Dto/query.filter.dto";
import { discountTypeEnum, IVariant } from "src/DB/models/Product/product.model";

// Custom validator to ensure unique (color + size) pairs within the same product
@ValidatorConstraint({ name: 'UniqueVariantPairs', async: false })
export class UniqueVariantPairsValidator implements ValidatorConstraintInterface {
    validate(variants: any[], _args: ValidationArguments): boolean {
        if (!Array.isArray(variants)) return true;
        const seenPairs = new Set<string>();
        for (const variant of variants) {
            if (!variant) continue;
            const color = typeof variant.color === 'string' ? variant.color.trim().toLowerCase() : '';
            const sizes: any[] = Array.isArray(variant.size) ? variant.size : [];
            const seenSizesInVariant = new Set<string>();
            for (const s of sizes) {
                const sizeVal = typeof s?.size === 'string' ? s.size.trim().toLowerCase() : '';
                if (!sizeVal) continue;
                // ensure no duplicate sizes inside a single variant
                if (seenSizesInVariant.has(sizeVal)) return false;
                seenSizesInVariant.add(sizeVal);
                const key = `${color}|${sizeVal}`;
                if (seenPairs.has(key)) return false;
                seenPairs.add(key);
            }
        }
        return true;
    }
    defaultMessage(_args: ValidationArguments): string {
        return 'Duplicate variant combinations: each color+size pair must be unique within the product';
    }
}


export class SizeDTO {
    @IsString()
    size: string;
    @IsNumber()
    @IsPositive()
    stock: number;
}
export class ProductVariantDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SizeDTO)
    size: SizeDTO[];

    @IsString()
    color: string;
}
export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    titleArabic: string;

    @IsString()
    @IsNotEmpty()
    titleEnglish: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    descriptionArabic: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    descriptionEnglish: string;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    price: number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    discount: number;

    @IsMongoId()
    @Type(() => Types.ObjectId)
    category: Types.ObjectId;

    @IsString()
    @IsOptional()
    discountType?: discountTypeEnum;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDTO)
    @Validate(UniqueVariantPairsValidator)
    variants: ProductVariantDTO[]

}
export class AddVariantDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDTO)
    @Validate(UniqueVariantPairsValidator)
    variants: ProductVariantDTO[]
}
export class UpdateProductDTO {
    @IsString()
    @IsNotEmpty()
    titleArabic?: string;

    @IsString()
    @IsNotEmpty()
    titleEnglish?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    descriptionArabic?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    descriptionEnglish?: string;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    price?: number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    discount?: number;

    @IsMongoId()
    @Type(() => Types.ObjectId)
    category?: Types.ObjectId;

    @IsString()
    @IsOptional()
    discountType?: discountTypeEnum;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDTO)
    @Validate(UniqueVariantPairsValidator)
    variants: ProductVariantDTO[]
}

export class ProductIdDTO {
    @IsMongoId()
    productId: Types.ObjectId;
}

export class ProductFilterDTO extends QueryFilterDto {

    @IsString()
    @IsOptional()
    @MinLength(1)
    name?: string


    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    minPrice?: number

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    maxPrice?: number

    @IsMongoId()
    @IsOptional()
    categoryId?: string


    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @IsPositive()
    stock?: number

}

export class EditVariantDTO {
    @IsMongoId()
    @Type(() => Types.ObjectId)
    variantId: Types.ObjectId;

    @IsMongoId()
    @Type(() => Types.ObjectId)
    sizeId: Types.ObjectId;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    stock: number;

    @IsOptional()
    @IsString()
    size: string;

    @IsOptional()
    @IsString()
    color: string;
}