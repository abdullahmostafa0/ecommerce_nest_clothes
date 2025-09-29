import { Module } from "@nestjs/common";
import { SubCategoryController } from "./subCategory.controller";
import { SubCategoryRepository } from "src/DB/models/SubCategory/subCategory.repository";
import { SubCategoryService } from "./subCategory.service";
import { CloudService } from "src/common/service/cloud.service";
import { CategoryRepository } from "src/DB/models/Category/category.repository";
import { CategoryModel } from "src/DB/models/Category/category.model";
import { SubCategoryModel } from "src/DB/models/SubCategory/subCategory.model";

@Module({
    imports: [SubCategoryModel, CategoryModel],
    controllers: [SubCategoryController],
    providers: [
        CategoryRepository,
        CloudService,
        SubCategoryService,
        SubCategoryRepository
    ]
})
export class SubCategoryModule { }