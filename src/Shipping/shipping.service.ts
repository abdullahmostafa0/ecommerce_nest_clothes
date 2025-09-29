import { Injectable, NotFoundException } from "@nestjs/common";
import { ShippingRepository } from "src/DB/models/Shipping/shipping.repository";
import { CreateShippingDTO } from "./DTO";
import { DeleteResult, UpdateWriteOpResult } from "mongoose";
import { typeShipping } from "src/DB/models/Shipping/shipping.model";

@Injectable()
export class ShippingService {
    constructor(private readonly shippingRepository: ShippingRepository) {}

    async create(dto: CreateShippingDTO) {
        const doc = await this.shippingRepository.create({
            price: dto.price,
            government: dto.government,
        });
        return doc;
    }

    async getAll() {
        const shippings = await this.shippingRepository.findAll({});
        return shippings;
    }

    async delete(id: string) : Promise<DeleteResult>{
        const shipping = await this.shippingRepository.findOne({ _id: id });
        if (!shipping) {
            throw new NotFoundException("Shipping not found");
        }
        const shippingDeleted = await this.shippingRepository.deleteOne({ _id: id });
        return shippingDeleted;
    }

    async update(id: string, dto: CreateShippingDTO) : Promise<UpdateWriteOpResult>{
        const shipping = await this.shippingRepository.findOne({ _id: id });
        if (!shipping) {
            throw new NotFoundException("Shipping not found");
        }
        const shippingUpdated = await this.shippingRepository.updateOne(
            { _id: id },
            { $set: dto });
        return shippingUpdated;
    }
}


