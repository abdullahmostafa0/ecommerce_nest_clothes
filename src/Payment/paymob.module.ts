import { Module } from "@nestjs/common";
import { PaymobService } from "./paymob.service";
import { PaymobController } from "./paymob.controller";
import { OrderModel } from "src/DB/models/Order/order.model";
import { OrderRepository } from "src/DB/models/Order/order.repository";

@Module({
    imports: [OrderModel],
    controllers: [PaymobController],
    providers: [PaymobService, OrderRepository],
    exports: [PaymobService]
})
export class PaymobModule { }


