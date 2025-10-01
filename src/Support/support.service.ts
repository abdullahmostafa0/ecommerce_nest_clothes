import { Injectable } from "@nestjs/common";
import { SupportRepository } from "src/DB/models/Support/support.repository";
import { CreateSupportDTO } from "./DTO";
import { sendEmail } from "src/common/Utility/sendEmail";
import { emailEvent } from "src/common/Utility/email.event";

@Injectable()
export class SupportService {
    constructor(private readonly supportRepository: SupportRepository) {}

    async create(dto: CreateSupportDTO) {
        const doc = await this.supportRepository.create({
            name: dto.name,
            phone: dto.phone,
            message: dto.message,
        });
        emailEvent.emit('support', { 
            email: process.env.SUPPORT_EMAIL, 
            message: dto.message,
            phone: dto.phone,
            name: dto.name,
        });
        return doc;
        // fire-and-forget (do not await) to avoid delaying response
    
    }

    async getAll() {
        const support = await this.supportRepository.findAll({});
        return support;
    }
}


