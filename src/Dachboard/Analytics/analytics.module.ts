import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { OrderModel } from "src/DB/models/Order/order.model";
import { OrderRepository } from "src/DB/models/Order/order.repository";

@Module({
    imports: [OrderModel],
    controllers: [AnalyticsController],
    providers: [AnalyticsService, OrderRepository]
})
export class AnalyticsModule { }


