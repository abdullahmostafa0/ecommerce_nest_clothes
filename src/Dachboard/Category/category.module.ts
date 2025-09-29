import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { CategoryRepository } from "src/DB/models/Category/category.repository";
import { CategoryModel } from "src/DB/models/Category/category.model";
import { TokenService } from "src/common/service/token.service";
import { UserRepository } from "src/DB/models/User/user.repository";
import { JwtService } from "@nestjs/jwt";
import { UserModel } from "src/DB/models/User/user.model";
import { CloudService } from "src/common/service/cloud.service";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { ProductModel } from "src/DB/models/Product/product.model";

@Module({
    imports: [CategoryModel, ProductModel],
    controllers: [CategoryController],
    providers: [
        CategoryService,
        CategoryRepository,
        CloudService,
        ProductRepository
    ]
})
export class CategoryModule { }