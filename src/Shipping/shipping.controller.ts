import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ShippingService } from "./shipping.service";
import { CreateShippingDTO } from "./DTO";
import { Public } from "src/common/Decorator/public.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { Role } from "src/common/Decorator/role.decorator";

@UsePipes(new ValidationPipe({ whitelist: true }))
@UseGuards(AuthGuard, RoleGuard)
@Controller("shipping")
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) {}

    @Role(["admin"])
    @Post()
    async create(@Body() dto: CreateShippingDTO) {
        const shipping = await this.shippingService.create(dto);
        return { shipping };
    }

    @Public("public")
    @Get()
    async getAll() {
        const shipping = await this.shippingService.getAll();
        return { shipping };
    }

    @Role(["admin"])
    @Delete(":id")
    async delete(@Param("id") id: string) {
        const shipping = await this.shippingService.delete(id);
        return { shipping };
    }

    @Role(["admin"])
    @Patch(":id")
    async update(@Param("id") id: string, @Body() dto: CreateShippingDTO) {
        const shipping = await this.shippingService.update(id, dto);
        return { shipping };
    }
}


