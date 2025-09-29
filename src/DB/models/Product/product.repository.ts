import { DBService } from "src/DB/db.service";
import { Product, productType } from "./product.model";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ProductRepository extends DBService<productType>{ 
    constructor(@InjectModel(Product.name) private readonly productModel: Model<productType>) {
        super(productModel)
    }
}