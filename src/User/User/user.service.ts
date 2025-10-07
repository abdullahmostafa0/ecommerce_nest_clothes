import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Types, UpdateWriteOpResult } from "mongoose";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { TypeUser } from "src/DB/models/User/user.model";
import { UserRepository } from "src/DB/models/User/user.repository";



@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly productRepository: ProductRepository
    ) { }

    async addToFavorite(id: Types.ObjectId, req: Request): Promise<UpdateWriteOpResult> {
        try {
            const product = await this.productRepository.findOne({ _id: id })
            if (!product) {
                throw new NotFoundException("Product not found")
            }
            const updated = await this.userRepository.updateOne(
                { _id: req["user"]._id },
                { $addToSet: { favorites: id } }
            )
            return updated;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }


    async removeFromFavorite(id: Types.ObjectId, req: Request): Promise<UpdateWriteOpResult> {
        try {
            const product = await this.productRepository.findOne({ _id: id })
            if (!product) {
                throw new NotFoundException("Product not found")
            }
            const updated = await this.userRepository.updateOne(
                { _id: req["user"]._id },
                { $pull: { favorites: id } }
            )

            return updated;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async getFavorite(req: Request): Promise<TypeUser | null> {
        try {
            const updated = await this.userRepository.findOne(
                { _id: req["user"]._id }, { favorites: 1, _id: 0 })// select only favorites, hide _id

            return updated;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }


    }

    async getProfile(req: Request): Promise<TypeUser | null> {
        try {
            if (!req["user"] || !req["user"]._id) {
                throw new NotFoundException("User not authenticated")
            }

            const updated = await this.userRepository.findOne(
                { _id: req["user"]._id }
            )
            return updated;

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(error)
        }
    }
}