import { DBService } from "src/DB/db.service";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Cart, typeCart } from "./cart.model";

@Injectable()
export class CartRepository extends DBService<typeCart> {
    constructor(@InjectModel(Cart.name) cartModel: Model<typeCart>) { 
        super(cartModel)
    }
}