import { Types } from "mongoose";
import { IVariant } from "src/DB/models/Product/product.model";

export interface ICartProduct {
    _id?:Types.ObjectId;
    productId:Types.ObjectId;
    variantId:Types.ObjectId;
    sizeId:Types.ObjectId;
    variant: { size: string, color: string };
    quantity:number;
}



export interface ICart {
    _id?:Types.ObjectId;
    createdBy:Types.ObjectId;

    products:ICartProduct[],

    createdAt?:Date;
    updatedAt?:Date;

}