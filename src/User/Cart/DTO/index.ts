import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString, Validate, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Type } from "class-transformer";

@ValidatorConstraint({ name: 'customText', async: false })
export class CheckMongoIds implements ValidatorConstraintInterface {
    validate(ids: Types.ObjectId[], args: ValidationArguments) {
        for (const id of ids) {
            if(!Types.ObjectId.isValid){
                return false;
            }
        }
        return true
    }

    defaultMessage(args: ValidationArguments) {
        return 'In-Valid MongoId';
    }
}

export class variantDTO {
    
    @IsString()
    size: string;
    @IsString()
    color: string;
}

export class AddToCartDTO {

    @IsMongoId()
    productId: Types.ObjectId;

    @IsMongoId()
    variantId: Types.ObjectId

    @IsMongoId()
    sizeId: Types.ObjectId;

    @ValidateNested()
    @Type(() => variantDTO)
    variant: variantDTO;


    @IsNumber()
    @IsPositive()
    quantity: number;
}

export class ItemIdsDTO {

    @Validate(CheckMongoIds)
    productIds: Types.ObjectId[];
}