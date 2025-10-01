import { Body, Controller, Get, InternalServerErrorException, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { OrderService } from "./order.service";
import { Role } from "src/common/Decorator/role.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { Request } from "express";
import { CreateOrderDTO, CreateOrderWithoutLoginDTO, UpdateStatusDTO } from "./DTO";
import { OrderIdDTO } from "./order.interface";
import { Public } from "src/common/Decorator/public.decorator";

@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller("order")
@Role(["user"])
@UseGuards(AuthGuard, RoleGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    async create(
        @Body() createOrderDTO: CreateOrderDTO,
        @Req() req: Request) {
        const order = await this.orderService.createOrder(createOrderDTO, req)

        return {
            order
        }
    }

    @Public("public")
    @Post("without-login")
    async createwWithoutLogin(
        @Body() createOrderWithoutLoginDTO: CreateOrderWithoutLoginDTO) {
        const order = await this.orderService.createOrderWithoutLogin(createOrderWithoutLoginDTO)

        return {
            order
        }
    }
    @Public("public")
    @Patch(":orderId/cancelWithoutLogin")
    async cancelWithoutLogin(@Param() params: OrderIdDTO) {
        return await this.orderService.cancelWithoutLogin(params.orderId)
    }

    

    

    @Patch(":orderId")
    async checkOut(@Req() req: Request, @Param() params: OrderIdDTO) {
        const session = await this.orderService.checkOut(req, params.orderId)
        return {
            message: "Order Checked Out",
            session,
        }
    }

    @Patch(":orderId/cancel")
    async cancelOrder(@Req() req: Request, @Param() params: OrderIdDTO) {
        return await this.orderService.cancelOrder(req, params.orderId)
        
    }
    @Role(["admin", "superAdmin"])
    @Patch(":orderId/status")
    async updateStatus(@Param() params: OrderIdDTO, @Body() body: UpdateStatusDTO) {
        return await this.orderService.updateStatus(params.orderId, body)
    }

    @Get("get-orders-by-user")
    async getOrderByUser(@Req() req: Request) {
        return await this.orderService.getOrderByUser(req)
    }
    @Role(["admin", "superAdmin"])
    @Get("all-orders")
    async getAllOrders() {
        try {
            return await this.orderService.getAllOrders()
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}