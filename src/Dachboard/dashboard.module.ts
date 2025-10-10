import { Module } from "@nestjs/common";
import { CategoryModule } from "./Category/category.module";
import { SubCategoryModule } from "./SubCategory/subCategory.module";
import { AnalyticsModule } from "./Analytics/analytics.module";

@Module({
    imports: [CategoryModule, SubCategoryModule, AnalyticsModule],
    controllers: [],
    providers: []
})
export class DashboardModule {}