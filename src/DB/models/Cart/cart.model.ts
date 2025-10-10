import { MongooseModule, Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, SchemaTypes, Types } from "mongoose";
import { ICartProduct } from "src/User/Cart/cart.interface";



@Schema({ timestamps: true })
export class Cart {
    @Prop(
        raw([{
            productId: { type: Types.ObjectId, required: true, ref: 'Product' },
            variantId: { type: SchemaTypes.ObjectId, required: false },
            sizeId: { type: SchemaTypes.ObjectId, required: false },
            variant : { size: String, color: String },
            quantity: { type: Number, default: 1 },
        }]),
    )
    products: ICartProduct[];

    @Prop({ required: true, ref: 'User', type: Types.ObjectId, unique: true })
    createdBy: Types.ObjectId;

}

const cartSchema = SchemaFactory.createForClass(Cart)

export const CartModel = MongooseModule.forFeature([
    { name: Cart.name, schema: cartSchema }
])
export type typeCart = Cart & Document;