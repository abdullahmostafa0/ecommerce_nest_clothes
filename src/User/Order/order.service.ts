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
import { RealtimeGateway } from "src/gateway/gateway";
import { UserRepository } from "src/DB/models/User/user.repository";

@Injectable()
export class OrderService {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository,
        private readonly orderRepository: OrderRepository,
        private readonly cartService: CartService,
        private readonly paymentService: PaymentService,
        private readonly realtimeGateway: RealtimeGateway,
        private readonly userRepository: UserRepository
    ) { }

    async createOrder(createOrderDTO: CreateOrderDTO, req: Request) {
        try {
            const cart = await this.cartRepository.findOne({ createdBy: req["user"]._id })
            if (!cart?.products?.length) {
                return new NotFoundException("Cart Empty")
            }

            let subTotal: number = 0
            const products: IorderProduct[] = []
            console.log(cart.products)
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
                console.log(product.quantity)
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
            let finalPrice = subTotal
            if (createOrderDTO.discountPercent) {
                finalPrice = Math.floor(
                    subTotal - (createOrderDTO.discountPercent / 100) * subTotal
                )
            }

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
                        $inc: { "variants.$[v].size.$[s].stock": -product.quantity }
                    },
                    {
                        arrayFilters: [
                            { "v._id": product.variantId },
                            { "s._id": product.sizeId, "s.stock": { $gte: product.quantity } }
                        ]
                    }
                );
            }
            const user = await this.userRepository.findOne({ _id: req["user"]._id })

            return { messaga: "Done" }
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async checkOut(req: Request, orderId: Types.ObjectId)
        : Promise<Stripe.Response<Stripe.Checkout.Session>> {

        const order = await this.orderRepository.findOne({
            _id: orderId,
            createdBy: req["user"]._id,
            status: OrderStatus.pending,
            paymentWay: PaymentWay.card
        })

        if (!order) {
            throw new BadRequestException("Order not found")
        }
        const discounts: { coupon: string }[] = [];
        if (order.discountAmount) {
            const coupon = await this.paymentService.createCoupon({
                percent_off: order.discountAmount,
                duration: "once"
            })
            discounts.push({ coupon: coupon.id })
        }
        const session = await this.paymentService.checkoutSession({
            customer_email: req["user"].email,
            line_items: order.products.map((product) => {
                return {
                    quantity: product.quantity,
                    price_data: {
                        product_data: {
                            name: product.name,
                        },
                        currency: "egp",
                        unit_amount: product.unitPrice * 100
                    },
                }
            }),
            metadata: {
                orderId: orderId as unknown as string
            },
            discounts
        })
        const intent = await this.paymentService.createPaymentIntent(order.finalPrice)

        await this.orderRepository.updateOne(
            { _id: order._id },
            { intentId: intent.id }
        )
        return session
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
                        _id: product.productId,
                        variants: {
                            $elemMatch: {
                                _id: product.variantId,
                                size: { $elemMatch: { _id: product.sizeId } },
                                stock: { $gte: product.quantity }
                            }
                        }
                    })
                if (!checkProduct) {
                    throw new BadRequestException("Product not found")
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
            let finalPrice = subTotal
            if (createOrderWithoutLoginDTO.discountPercent) {
                finalPrice = Math.floor(
                    subTotal - (createOrderWithoutLoginDTO.discountPercent / 100) * subTotal
                )
            }
            const { email, address, phone, note, paymentWay, discountPercent } = createOrderWithoutLoginDTO
            const order = await this.orderRepository.create({
                email,
                address,
                phone,
                note,
                paymentWay,
                products,
                subTotal,
                finalPrice,
                discountAmount: discountPercent
            })

            for (const product of products) {
                await this.productRepository.updateOne(
                    { _id: product.productId },
                    {
                        $inc: { "variants.$[v].size.$[s].stock": -product.quantity }
                    },
                    {
                        arrayFilters: [
                            { "v._id": product.variantId },
                            { "s._id": product.sizeId, "s.stock": { $gte: product.quantity } }
                        ]
                    }
                );
            }
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

        await this.orderRepository.updateOne(
            { _id: orderId },
            {
                status: OrderStatus.cancelled            }
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
            return order
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}