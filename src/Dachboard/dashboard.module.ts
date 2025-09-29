import { Module } from "@nestjs/common";
import { CategoryModule } from "./Category/category.module";
import { SubCategoryModule } from "./SubCategory/subCategory.module";

@Module({
    imports: [CategoryModule, SubCategoryModule],
    controllers: [],
    providers: []
})
export class DashboardModule {}