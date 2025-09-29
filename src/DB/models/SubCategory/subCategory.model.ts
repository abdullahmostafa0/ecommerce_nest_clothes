/* eslint-disable @typescript-eslint/no-require-imports */
import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, SchemaTypes, Types } from "mongoose";
import slugify from "slugify";
import { transliterate } from "transliteration";
export interface IImage {
    secure_url: string,
    public_id: string
}

@Schema({ timestamps: true })
export class SubCategory {
    @Prop({ type: String, unique: true, trim: true, required: true })
    nameArabic: string;

    @Prop({ type: String, unique: true, trim: true, required: true })
    nameEnglish: string;

    @Prop({ type: String, trim: true, required: false })
    slugEnglish: string;

    @Prop({ type: String, trim: true, required: false })
    slugArabic: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: Types.ObjectId

    @Prop({ type: { secure_url: String, public_id: String } })
    image: IImage;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: String })
    folderId: string

}

const subCategorySchema = SchemaFactory.createForClass(SubCategory)

// Pre-save hook to set slug fields to empty string if not provided
subCategorySchema.pre('save', function (next) {
    if (this.slugEnglish === undefined || this.slugEnglish === null) {
        this.slugEnglish = '';
    }
    if (this.slugArabic === undefined || this.slugArabic === null) {
        this.slugArabic = '';
    }
    next();
});

export const SubCategoryModel = MongooseModule.forFeature([
    { name: SubCategory.name, schema: subCategorySchema }
])
export type typeSubCategory = SubCategory & Document;