import { DBService } from "src/DB/db.service";
import { SubCategory, typeSubCategory } from "./subCategory.model";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class SubCategoryRepository extends DBService<typeSubCategory> {
    constructor(@InjectModel(SubCategory.name) subCategoryModel: Model<typeSubCategory>) { 
        super(subCategoryModel)
    }
}