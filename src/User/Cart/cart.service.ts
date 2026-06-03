import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AddToCartDTO, ItemIdsDTO } from "./DTO";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { Request } from "express";
import { Types } from "mongoose";

@Injectable()
export class CartService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly cartRepository: CartRepository
    ) { }


    async addToCart(addToCartDTO: AddToCartDTO, req: Request) {
        try {
            const productId = new Types.ObjectId(addToCartDTO.productId as any);
            const quantity = addToCartDTO.quantity;
            const variantColor = addToCartDTO.variant?.color;
            const variantSize = addToCartDTO.variant?.size;

            if (!variantColor || !variantSize) {
                throw new BadRequestException("Variant color and size are required");
            }

            const product = await this.productRepository.findOne(
                {
                    _id: productId,
                    variants: {
                        $elemMatch: {
                            color: variantColor,
                            size: { $elemMatch: { size: variantSize, stock: { $gte: quantity }}},
                        },
                    }
                }
            )
            if (!product) {
                throw new NotFoundException("Product not found or out of stock")
            }

            const cart = await this.cartRepository.findOne({ createdBy: req["user"]._id })

            if (!cart) {
                const newCart = await this.cartRepository.create({
                    createdBy: req["user"]._id,
                    products: [addToCartDTO]
                })
                return newCart
            }
            let match = false
            for (const [index, product] of cart.products.entries()) {
                if (product.productId.toString() === addToCartDTO.productId.toString()
                    && product.variantId.toString() === addToCartDTO.variantId.toString()
                    && product.sizeId.toString() === addToCartDTO.sizeId.toString()
                ) {
                    cart.products[index].quantity = addToCartDTO.quantity
                    match = true
                    break;
                }
            }
            if (!match) {
                await this.cartRepository.updateOne({
                    _id: cart._id
                }, {
                    $push: {
                        products: addToCartDTO
                    }
                })
            }
            await cart.save()
            return { message: "Done" }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(error)
        }


    }

    async removeFromCart(itemsId: ItemIdsDTO, req: Request) {

        try {
            const cart = await this.cartRepository.updateOne({
                createdBy: req["user"]._id
            },
                {
                    $pull: {
                        products: {
                            productId: { $in: itemsId.productIds }
                        }
                    }
                }
            )
            return { message: "Done" }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(error)
        }


    }

    async clearCart(req: Request) {
        try {
            const cart = await this.cartRepository.updateOne({
                createdBy: req["user"]._id
            },
                {
                    products: []
                }
            )
            return { message: "Done" }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(error)
        }


    }

    async getCart(req: Request) {
        try {
            const cart = await this.cartRepository.findOne({
                createdBy: req["user"]._id
            }, {}, {},
                [{ path: "products.productId" }]
            )

            return cart
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(error)
        }

    }
}