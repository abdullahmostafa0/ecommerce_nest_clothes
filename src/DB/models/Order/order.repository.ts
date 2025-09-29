import { DBService } from "src/DB/db.service";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, typeOrder } from "./order.model";

@Injectable()
export class OrderRepository extends DBService<typeOrder>{ 
    constructor(@InjectModel(Order.name) private readonly orderModel: Model<typeOrder>) {
        super(orderModel)
    }
}