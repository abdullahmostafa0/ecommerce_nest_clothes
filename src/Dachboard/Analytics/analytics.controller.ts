import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { Role } from "src/common/Decorator/role.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { SalesOverTimeDto } from "./dto/time-range.dto";

@Controller("dashboard/analytics")
@Role(["superAdmin", "admin"])
@UseGuards(AuthGuard, RoleGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get("sales-over-time")
    async salesOverTime(@Query() dto: SalesOverTimeDto) {
        const data = await this.analyticsService.salesOverTime(dto);
        return { message: "Done", data };
    }

    @Get("orders-over-time")
    async ordersOverTime(@Query() dto: SalesOverTimeDto) {
        const data = await this.analyticsService.ordersCountOverTime(dto);
        return { message: "Done", data };
    }
}


