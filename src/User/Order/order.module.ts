import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { CartModel } from "src/DB/models/Cart/cart.model";
import { OrderModel } from "src/DB/models/Order/order.model";
import { ProductModel } from "src/DB/models/Product/product.model";
import { OrderRepository } from "src/DB/models/Order/order.repository";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CartService } from "../Cart/cart.service";
import { PaymentService } from "src/common/service/payment.service";
import { UserModel } from "src/DB/models/User/user.model";
import { UserRepository } from "src/DB/models/User/user.repository";
import { PaymobModule } from "src/Payment/paymob.module";

@Module({
    imports:[CartModel, ProductModel, OrderModel, UserModel, PaymobModule],
    controllers:[OrderController],
    providers:[
        OrderService,
        CartRepository, 
        OrderRepository, 
        ProductRepository, 
        CartService,
        PaymentService,
        UserRepository,
    ],
})
export class OrderModule {}