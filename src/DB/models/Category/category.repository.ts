import { DBService } from "src/DB/db.service";
import { Category, typeCategory } from "./category.model";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class CategoryRepository extends DBService<typeCategory> {
    constructor(@InjectModel(Category.name) categoryModel: Model<typeCategory>) { 
        super(categoryModel)
    }
}