import { Module } from "@nestjs/common";
import { ProductModel } from "src/DB/models/Product/product.model";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CategoryRepository } from "src/DB/models/Category/category.repository";
import { CategoryService } from "src/Dachboard/Category/category.service";
import { CategoryModel } from "src/DB/models/Category/category.model";
import { CloudService } from "src/common/service/cloud.service";
import { CartModel } from "src/DB/models/Cart/cart.model";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { UserRepository } from "src/DB/models/User/user.repository";
import { UserModel } from "src/DB/models/User/user.model";

@Module({
    imports: [ProductModel, CategoryModel, CartModel, UserModel],
    controllers: [ProductController],
    providers: [
        ProductService,
        ProductRepository,
        CategoryRepository,
        CategoryService,
        CloudService,
        CartRepository,
        UserRepository
    ]
})
export class ProductModule { }