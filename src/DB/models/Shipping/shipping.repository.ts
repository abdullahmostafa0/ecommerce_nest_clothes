import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DBService } from "src/DB/db.service";
import { Shipping, typeShipping } from "./shipping.model";

@Injectable()
export class ShippingRepository extends DBService<typeShipping>{
    constructor(@InjectModel(Shipping.name) private readonly shippingModel: Model<typeShipping>) {
        super(shippingModel)
    }
}


