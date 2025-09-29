import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { UserRepository } from "src/DB/models/User/user.repository";
import { ProductModel } from "src/DB/models/Product/product.model";
import { UserModel } from "src/DB/models/User/user.model";


@Module({
    imports: [ProductModel, UserModel],
    controllers: [UserController],
    providers: [
        UserService,
        ProductRepository,
        UserRepository],
})
export class UserModulee { }