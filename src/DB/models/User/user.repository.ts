
import { DBService } from "src/DB/db.service";
import { TypeUser, User } from "./user.model";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

export class UserRepository extends DBService<TypeUser> {

    constructor(@InjectModel(User.name) private readonly  userModel: Model<TypeUser> ){
        super(userModel);
    }

    async findByEmail(email: string): Promise<TypeUser | null> {
        return this.findOne({email});
    }
    
}