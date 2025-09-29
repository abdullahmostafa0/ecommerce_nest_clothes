import { Injectable } from "@nestjs/common";
import { SupportRepository } from "src/DB/models/Support/support.repository";
import { CreateSupportDTO } from "./DTO";
import { sendEmail } from "src/common/Utility/sendEmail";

@Injectable()
export class SupportService {
    constructor(private readonly supportRepository: SupportRepository) {}

    async create(dto: CreateSupportDTO) {
        const doc = await this.supportRepository.create({
            name: dto.name,
            phone: dto.phone,
            message: dto.message,
        });
        return doc;
        // fire-and-forget (do not await) to avoid delaying response
    
    }

    async getAll() {
        const support = await this.supportRepository.findAll({});
        return support;
    }
}


