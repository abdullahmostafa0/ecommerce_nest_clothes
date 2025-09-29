import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class Support {
    @Prop({ type: String, required: true, trim: true })
    name: string;

    @Prop({ type: String, required: true, trim: true })
    phone: string;

    @Prop({ type: String, required: true, trim: true, maxlength: 2000 })
    message: string;
}

export const supportSchema = SchemaFactory.createForClass(Support);

export type typeSupport = HydratedDocument<Support> & Document;

export const SupportModel = MongooseModule.forFeature([{ name: Support.name, schema: supportSchema }]);


