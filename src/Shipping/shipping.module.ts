import { Module } from "@nestjs/common";
import { ShippingController } from "./shipping.controller";
import { ShippingService } from "./shipping.service";
import { ShippingRepository } from "src/DB/models/Shipping/shipping.repository";
import { ShippingModel } from "src/DB/models/Shipping/shipping.model";

@Module({
    imports: [ShippingModel],
    controllers: [ShippingController],
    providers: [ShippingService, ShippingRepository]
})
export class ShippingModule {}


