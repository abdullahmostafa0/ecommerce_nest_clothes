import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { SupportService } from "./support.service";
import { CreateSupportDTO } from "./DTO";
import { Public } from "src/common/Decorator/public.decorator";

@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller("support")
export class SupportController {
    constructor(private readonly supportService: SupportService) {}

    @Public("public")
    @Post()
    async create(@Body() dto: CreateSupportDTO) {
        const support = await this.supportService.create(dto);
        return { support };
    }

    @Public("public")
    @Get()
    async getAll() {
        const support = await this.supportService.getAll();
        return { support };
    }
}


