
import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { UserRole } from "src/common/enums";

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User {
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: String, required: true, unique: true })
    email: string;
    @Prop({ type: String, required: true })
    password: string;

    @Prop({ type: String, required: true})
    phone: string;

    @Prop({ type: String, required: true})
    address: string;
    
    @Prop({ type: String, required: false })
    emailOtp: string;

    @Prop({type: String, enum : UserRole, default: UserRole.USER})
    role:string

    @Prop({type: Date})
    changeCredentialsTime:Date

    @Prop({type: [Types.ObjectId], ref: 'Product', default: []})
    favorites : Types.ObjectId[]
}
const userSchema = SchemaFactory.createForClass(User)

export const UserModel = MongooseModule.forFeature(
    [{ name: User.name, schema: userSchema }])

export type TypeUser = User & Document
export const connectedUser = new Map()