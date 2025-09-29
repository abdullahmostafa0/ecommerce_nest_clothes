import { Module } from "@nestjs/common";
import { CartModule } from "./Cart/cart.module";
import { OrderModule } from "./Order/order.module";
import { UserModulee } from "./User/user.module";

@Module({
    imports: [CartModule, OrderModule, UserModulee],
    controllers: [],
    providers: []
})
export class UserModule {}