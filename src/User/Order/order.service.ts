/* eslint-disable no-unsafe-optional-chaining */
/*  */
/*  */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { CreateOrderDTO, CreateOrderWithoutLoginDTO, UpdateStatusDTO } from "./DTO";
import { Request } from "express";
import { IorderProduct, OrderIdDTO, OrderStatus, PaymentWay } from "./order.interface";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { Matches } from "class-validator";
import { OrderRepository } from "src/DB/models/Order/order.repository";
import { CartService } from "../Cart/cart.service";
import { Types } from "mongoose";
import { PaymentService } from "src/common/service/payment.service";
import Stripe from "stripe";
import { PaymobService } from "src/Payment/paymob.service";
import { UserRepository } from "src/DB/models/User/user.repository";
import { emailEvent } from "src/common/Utility/email.event";
import { emit } from "process";
import { ShippingRepository } from "src/DB/models/Shipping/shipping.repository";

@Injectable()
export class OrderService {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository,
        private readonly orderRepository: OrderRepository,
        private readonly cartService: CartService,
        private readonly paymentService: PaymentService,
        private readonly userRepository: UserRepository,
        private readonly paymobService: PaymobService,
        private readonly shippingRepository: ShippingRepository
    ) { }

    async createOrder(createOrderDTO: CreateOrderDTO, req: Request) {
        try {
            const cart = await this.cartRepository.findOne({ createdBy: req["user"]._id })
            if (!cart?.products?.length) {
                return new NotFoundException("Cart Empty")
            }

            let subTotal: number = 0
            const products: IorderProduct[] = []
            for (const product of cart.products) {
                const checkProduct = await this.productRepository.findOne(
                    {
                        _id: product.productId,
                        variants: {
                            $elemMatch: {
                                _id: product.variantId,
                                size: { $elemMatch: { _id: product.sizeId } },
                            }
                        }

                    }
                )
                if (!checkProduct) {
                    throw new BadRequestException("In-Valid Product or out of stock" + product.productId)
                }
                products.push({
                    name: checkProduct.titleEnglish,
                    productId: checkProduct._id,
                    variantId: product.variantId,
                    sizeId: product.sizeId,
                    quantity: product.quantity,
                    unitPrice: checkProduct.finalPrice,
                    finalPrice: checkProduct.finalPrice * product.quantity
                })
                subTotal += checkProduct.finalPrice * product.quantity
            }
            const shipping = await this.shippingRepository.findOne({ _id: createOrderDTO.shippingId })
            if (!shipping) {
                throw new BadRequestException("Shipping not found")
            }
            subTotal += shipping.price
            let finalPrice = subTotal
            

            const order = await this.orderRepository.create({
                ...createOrderDTO,
                subTotal,
                discountAmount: createOrderDTO.discountPercent,
                products,
                createdBy: req["user"]._id,
                finalPrice
            })
            await this.cartService.clearCart(req)

            for (const product of products) {
                await this.productRepository.updateOne(
                    { _id: product.productId },
                    {
                        $inc: {
                            "variants.$[v].size.$[s].stock": -product.quantity,
                            sellCount: product.quantity
                        },


                    },
                    {
                        arrayFilters: [
                            { "v._id": product.variantId },
                            { "s._id": product.sizeId, "s.stock": { $gte: product.quantity } }
                        ]
                    }
                );
            }
            console.log(req["user"].email)
            emailEvent.emit("CreateOrder", { email: req["user"].email, order, userName: req["user"].name })

            return { messaga: "Done" }
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async checkOut(req: Request, orderId: Types.ObjectId)
        : Promise<{ provider: string; url: string } | undefined> {

        try {
            const order = await this.orderRepository.findOne({
                _id: orderId,
                createdBy: req["user"]._id,
                status: OrderStatus.pending,
                paymentWay: PaymentWay.card
            })

            if (!order) {
                throw new BadRequestException("Order not found")
            }
            // If you want to use Paymob for card payments instead of Stripe

            const authToken = await this.paymobService.authenticate();

            // Reuse existing Paymob order if present to avoid duplicate merchant_order_id
            const amountCents = Math.round(order.finalPrice * 100);
            const existingIntentId = (order as any).intentId as string | undefined;
            const paymobOrderId = existingIntentId
                ? Number(existingIntentId)
                : await this.paymobService.registerOrder(
                    authToken,
                    `${String(orderId)}-${Date.now()}`,
                    amountCents
                );

            const paymentToken = await this.paymobService.generatePaymentKey(
                authToken,
                amountCents,
                paymobOrderId,
                {
                    email: req["user"].email,
                    phone_number: order.phone,
                    street: order.address || "NA",
                    city: "",
                    country: "EG",
                    postal_code: "",
                    state: "",
                    first_name: (req["user"].name?.split(" ")[0]) || "User",
                    last_name: (req["user"].name?.split(" ").slice(1).join(" ") || "NA"),
                }
            );
            const url = this.paymobService.getIframeUrl(paymentToken);
            if (!existingIntentId) {
                await this.orderRepository.updateOne({ _id: order._id }, { intentId: String(paymobOrderId) });
            }
            return { provider: "paymob", url };

        } catch (error) {
            throw new InternalServerErrorException(error)
        }


    }

    async checkOutWithoutLogin(orderId: Types.ObjectId) {
        try {
            const order = await this.orderRepository.findOne({
                _id: orderId,
                status: OrderStatus.pending,
                paymentWay: PaymentWay.card
            })

            if (!order) {
                throw new BadRequestException("Order not found or not eligible for payment")
            }

            const authToken = await this.paymobService.authenticate();

            // Reuse existing Paymob order if present to avoid duplicate merchant_order_id
            const amountCents = Math.round(order.finalPrice * 100);
            const existingIntentId = (order as any).intentId as string | undefined;
            const paymobOrderId = existingIntentId
                ? Number(existingIntentId)
                : await this.paymobService.registerOrder(
                    authToken,
                    `${String(orderId)}-${Date.now()}`,
                    amountCents
                );

            const paymentToken = await this.paymobService.generatePaymentKey(
                authToken,
                amountCents,
                paymobOrderId,
                {
                    email: order.email as string,
                    phone_number: order.phone as string,
                    street: order.address || "NA",
                    city: "",
                    country: "EG",
                    postal_code: "",
                    state: "",
                    first_name: order.firstName || "User",
                    last_name: order.lastName || "",
                }
            );
            const url = this.paymobService.getIframeUrl(paymentToken);
            if (!existingIntentId) {
                await this.orderRepository.updateOne({ _id: order._id }, { intentId: String(paymobOrderId) });
            }
            return { provider: "paymob", url };
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async cancelOrder(req: Request, orderId: Types.ObjectId) {

        const order = await this.orderRepository.findOne({
            _id: orderId,
            createdBy: req["user"]._id,
            $or: [
                { status: OrderStatus.pending },
                { status: OrderStatus.placed }
            ],
        })


        for (const product of order?.products as IorderProduct[]) {
            await this.productRepository.updateOne(
                { _id: product.productId },
                {
                    $inc: {
                        "variants.$[v].size.$[s].stock": product.quantity,
                        sellCount: -product.quantity
                    }
                },
                {
                    arrayFilters: [
                        { "v._id": product.variantId },
                        { "s._id": product.sizeId }
                    ]
                }
            );
        }

        await this.orderRepository.updateOne(
            { _id: orderId },
            {
                status: OrderStatus.cancelled,
                updatedBy: req["user"]._id
            }
        )

        if (!order) {
            throw new BadRequestException("Order not found")
        }

        return { message: "Done" }
    }

    async createOrderWithoutLogin(createOrderWithoutLoginDTO: CreateOrderWithoutLoginDTO) {
        try {
            let subTotal: number = 0
            const products: IorderProduct[] = []
            for (const product of createOrderWithoutLoginDTO.products) {
                const checkProduct = await this.productRepository.findOne(
                    {
                        _id: new Types.ObjectId(product.productId),
                        variants: {
                            $elemMatch: {
                                _id: new Types.ObjectId(product.variantId),
                                size: {
                                    $elemMatch: {
                                        _id: new Types.ObjectId(product.sizeId),
                                        stock: { $gte: product.quantity }
                                    }
                                }
                            }
                        }
                    })
                if (!checkProduct) {
                    throw new BadRequestException("Product not found or out of stock")
                }
                products.push({
                    name: checkProduct.titleEnglish,
                    productId: checkProduct._id,
                    variantId: product.variantId,
                    sizeId: product.sizeId,
                    quantity: product.quantity,
                    unitPrice: checkProduct.finalPrice,
                    finalPrice: checkProduct.finalPrice * product.quantity
                })
                subTotal += checkProduct.finalPrice * product.quantity
            }
            const shipping = await this.shippingRepository.findOne({ _id: createOrderWithoutLoginDTO.shippingId })
            if (!shipping) {
                throw new BadRequestException("Shipping not found")
            }
            subTotal += shipping.price
            let finalPrice = subTotal
            
            const { email, address, phone, note, paymentWay, firstName, lastName } = createOrderWithoutLoginDTO
            const order = await this.orderRepository.create({
                email,
                address,
                phone,
                note,
                paymentWay,
                products,
                subTotal,
                finalPrice,
                firstName: firstName,
                lastName: lastName
            })

            for (const product of products) {
                await this.productRepository.updateOne(
                    { _id: product.productId },
                    {
                        $inc: {
                            "variants.$[v].size.$[s].stock": -product.quantity,
                            sellCount: product.quantity
                        }
                    },
                    {
                        arrayFilters: [
                            { "v._id": product.variantId },
                            { "s._id": product.sizeId, "s.stock": { $gte: product.quantity } }
                        ]
                    }
                );
            }
            emailEvent.emit("CreateOrder", { email: order.email, order, userName: order.firstName + " " + order.lastName })
            return order
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    async cancelWithoutLogin(orderId: Types.ObjectId) {
        const order = await this.orderRepository.findOne({
            _id: orderId,
            $or: [
                { status: OrderStatus.pending },
                { status: OrderStatus.placed }
            ],
        })
        if (!order) {
            throw new BadRequestException("Order not found")
        }
        for (const product of order?.products as IorderProduct[]) {
            await this.productRepository.updateOne(
                { _id: product.productId },
                {
                    $inc: {
                        "variants.$[v].size.$[s].stock": product.quantity,
                        sellCount: -product.quantity
                    }
                },
                {
                    arrayFilters: [
                        { "v._id": product.variantId },
                        { "s._id": product.sizeId }
                    ]
                }
            );
        }

        await this.orderRepository.updateOne(
            { _id: orderId },
            {
                status: OrderStatus.cancelled
            }
        )
        return { message: "Done" }
    }
    async getOrderByUser(req: Request) {
        const orders = await this.orderRepository.findAll({ filter: { createdBy: req["user"]._id } })
        return orders
    }

    async getAllOrders() {
        try {
            const orders = await this.orderRepository.findAll({ filter: {} })
            return orders
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async updateStatus(orderId: Types.ObjectId, body: UpdateStatusDTO) {
        try {
            const order = await this.orderRepository.findOne({ _id: orderId })
            if (!order) {
                throw new BadRequestException("Order not found")
            }
            order.status = body.status

            await order.save()
            if (order.email) {
                emailEvent.emit("OrderStatus", { email: order.email, order, userName: order.firstName})
            }
            else {
                const user = await this.userRepository.findOne({ _id: order.createdBy })
                emailEvent.emit("OrderStatus", { email: user?.email, order, userName: user?.name })
            }



            if (body.status === OrderStatus.cancelled) {
                for (const product of order?.products as IorderProduct[]) {
                    await this.productRepository.updateOne(
                        { _id: product.productId },
                        {
                            $inc: { "variants.$[v].size.$[s].stock": product.quantity }
                        },
                        {
                            arrayFilters: [
                                { "v._id": product.variantId },
                                { "s._id": product.sizeId }
                            ]
                        }
                    );
                }
            }
            return order
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}