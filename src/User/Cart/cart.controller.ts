import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { CartService } from "./cart.service";
import { RoleGuard } from "src/common/Guards/role.guard";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { Role } from "src/common/Decorator/role.decorator";
import { AddToCartDTO, ItemIdsDTO } from "./DTO";
import { Request } from "express";

@Controller("user/cart")
@Role(["user", "superAdmin"])
@UseGuards(AuthGuard, RoleGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }


    @Post()
    async addToCart(
        @Body() addToCartDTO: AddToCartDTO,
        @Req() req: Request) {
        const added = await this.cartService.addToCart(addToCartDTO, req);
        return {
            message: "Done",
            added
        };
    }

    @Patch()
    async removeFromCart(
        @Body() itemsId: ItemIdsDTO,
        @Req() req: Request) {
        await this.cartService.removeFromCart(itemsId, req);
        return {
            message: "Done",
        };
    }

    @Delete()
    async clearCart(@Req() req: Request) {
        await this.cartService.clearCart(req);
        return {
            message: "Done",
        };
    }

    @Get()
    async getCart(@Req() req: Request) {
        const cart = await this.cartService.getCart(req);
        return {
            message: "Done",
            cart
        };
    }
}