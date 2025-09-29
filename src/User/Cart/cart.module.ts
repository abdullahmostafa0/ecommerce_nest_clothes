import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { ProductService } from "src/Seller/Product/product.service";
import { ProductModel } from "src/DB/models/Product/product.model";
import { CartModel } from "src/DB/models/Cart/cart.model";
import { ProductRepository } from "src/DB/models/Product/product.repository";

@Module({
    imports: [ProductModel, CartModel],
    controllers: [CartController],
    providers: [CartService, CartRepository, ProductRepository]
})
export class CartModule { }