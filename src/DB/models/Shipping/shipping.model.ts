import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class Shipping {
    @Prop({ type: Number, required: true, min: 0 })
    price: number;

    @Prop({ type: String, required: true, trim: true })
    government: string;
}

export const shippingSchema = SchemaFactory.createForClass(Shipping);

export type typeShipping = HydratedDocument<Shipping> & Document;

export const ShippingModel = MongooseModule.forFeature([{ name: Shipping.name, schema: shippingSchema }]);


