import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, SchemaTypes, Types } from "mongoose";
import slugify from "slugify";

export interface IImage {
    secure_url: string,
    public_id: string
}

@Schema({ timestamps: true })
export class Category {
    @Prop({ type: String, unique: true, trim: true, required: true })
    nameArabic: string;

    @Prop({ type: String, unique: true, trim: true, required: true })
    nameEnglish: string;
    

    @Prop({ type: { secure_url: String, public_id: String } })
    image: IImage;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({type: String})
    folderId: string

    @Prop({type: [Types.ObjectId], ref: 'SubCategory', default: []})
    subCategories: Types.ObjectId[]

}

const categorySchema = SchemaFactory.createForClass(Category)

export const CategoryModel = MongooseModule.forFeature([
    { name: Category.name, schema: categorySchema }
])
export type typeCategory = Category & Document;