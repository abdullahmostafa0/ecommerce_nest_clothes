import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DBService } from "src/DB/db.service";
import { Support, typeSupport } from "./support.model";

@Injectable()
export class SupportRepository extends DBService<typeSupport>{
    constructor(@InjectModel(Support.name) private readonly supportModel: Model<typeSupport>) {
        super(supportModel)
    }
}


