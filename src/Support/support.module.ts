import { Module } from "@nestjs/common";
import { SupportController } from "./support.controller";
import { SupportService } from "./support.service";
import { SupportRepository } from "src/DB/models/Support/support.repository";
import { SupportModel } from "src/DB/models/Support/support.model";

@Module({
    imports: [SupportModel],
    controllers: [SupportController],
    providers: [SupportService, SupportRepository]
})
export class SupportModule {}


