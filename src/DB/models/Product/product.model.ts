import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Category, IImage } from "../Category/category.model";
import slugify from "slugify";
import { User } from "../User/user.model";
import { SubCategory } from "../SubCategory/subCategory.model";

export enum discountTypeEnum {
    FIXED_PRICE = "fixedPrice",
    PERCENTAGE = "percentage"
}

export interface ISize {
    _id?: Types.ObjectId;
    size: string;
    stock: number;
}

export interface IVariant {
    _id?: Types.ObjectId;
    size?: ISize[];
    color?: string;
}
@Schema({ timestamps: true })
export class Product {

    @Prop({ type: String, required: true, trim: true })
    titleArabic: string;


    @Prop({ type: String, required: true, trim: true })
    titleEnglish: string;


    @Prop({ type: String, trim: true })
    descriptionArabic: string;

    @Prop({ type: String, trim: true })
    descriptionEnglish: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
    createdBy: Types.ObjectId;

    @Prop({
        type: SchemaTypes.ObjectId, default: function () {
            return this.createdBy

        }
    })
    updatedBy: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: Category.name })
    category: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, required: true, ref: SubCategory.name })
    subCategory: Types.ObjectId

    @Prop({ type: Number, required: true, min: 1 })
    price: number;

    @Prop({ type: Number, default: 0, min: 0, max: 100 })
    discount: number;

    @Prop({ type: String, enum: discountTypeEnum, default: discountTypeEnum.PERCENTAGE })
    discountType: discountTypeEnum;

    @Prop({
        type: Number, default: function () {
            return this.discountType === discountTypeEnum.PERCENTAGE ?
                this.price - (this.price * this.discount) / 100 :
                this.price - this.discount
        }
    })
    finalPrice: number;


    @Prop({ type: { secure_url: String, public_id: String }, required: false })
    mainImage: IImage;
    @Prop({ type: [{ secure_url: String, public_id: String }] })
    subImages: IImage[];

    @Prop({
        type: [{
            size: { type: [{ size: String, stock: { type: Number, default: 0, min: 0 } }] },
            color: String,
        }],
        default: []
    })
    variants: IVariant[];
    @Prop({ type: String })
    folderId: string


    @Prop({ type: Number, default: 0 , required: false})
    sellCount: number
}
export const productSchema = SchemaFactory.createForClass(Product);
// Enforce per-document uniqueness of (color + size) pairs within variants
productSchema.pre('validate', function (next) {
    try {
        const variants = (this as any).variants || [];
        const seenPairs = new Set<string>();
        for (const variant of variants) {
            if (!variant) continue;
            const color = typeof variant.color === 'string' ? variant.color.trim().toLowerCase() : '';
            const sizes = Array.isArray(variant.size) ? variant.size : [];
            const seenSizesInVariant = new Set<string>();
            for (const s of sizes) {
                const sizeVal = typeof s?.size === 'string' ? s.size.trim().toLowerCase() : '';
                if (!sizeVal) continue;
                if (seenSizesInVariant.has(sizeVal)) {
                    return next(new Error('Duplicate sizes within a variant are not allowed'));
                }
                seenSizesInVariant.add(sizeVal);
                const key = `${color}|${sizeVal}`;
                if (seenPairs.has(key)) {
                    return next(new Error('Duplicate variant combinations: each color+size must be unique'));
                }
                seenPairs.add(key);
            }
        }
        return next();
    } catch (err) {
        return next(err as any);
    }
});
export type productType = HydratedDocument<Product> & Document;

export const ProductModel = MongooseModule.forFeature([{ name: Product.name, schema: productSchema }]);