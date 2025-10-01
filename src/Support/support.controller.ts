import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { SupportService } from "./support.service";
import { CreateSupportDTO } from "./DTO";
import { Public } from "src/common/Decorator/public.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { Role } from "src/common/Decorator/role.decorator";

@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller("support")
@UseGuards(AuthGuard, RoleGuard)
export class SupportController {
    constructor(private readonly supportService: SupportService) {}

    @Public("public")
    @Post()
    async create(@Body() dto: CreateSupportDTO) {
        const support = await this.supportService.create(dto);
        return { support };
    }

    @Role(["admin", "superAdmin"])
    @Get()
    async getAll() {
        const support = await this.supportService.getAll();
        return { support };
    }
}


