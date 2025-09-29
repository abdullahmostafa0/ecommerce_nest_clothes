import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
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
            const variantId = new Types.ObjectId(addToCartDTO.variantId as any);
            const sizeId = new Types.ObjectId(addToCartDTO.sizeId as any);

            const product = await this.productRepository.findOne(
                {
                    _id: productId,
                    variants: {
                        $elemMatch: {
                            _id: variantId,
                            size: { $elemMatch: { _id: sizeId } },
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
                if (product.productId.toString() === addToCartDTO.productId.toString()) {
                    cart.products[index].quantity = addToCartDTO.quantity
                    match = true
                    break;
                }
            }
            if (!match) {
                cart.products.push(addToCartDTO)
            }
            await cart.save()
            return { message: "Done" }
        } catch (error) {
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
            throw new InternalServerErrorException(error)
        }

    }
}