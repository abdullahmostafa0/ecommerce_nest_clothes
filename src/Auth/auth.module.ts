
import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "../DB/models/User/user.repository";
import { UserModel } from "src/DB/models/User/user.model";
import { TokenService } from "src/common/service/token.service";
import { JwtService } from "@nestjs/jwt";


@Global()
@Module({
    imports:[UserModel],
    controllers:[AuthController],
    providers:[AuthService, UserRepository, TokenService, JwtService],
    exports:[UserRepository, TokenService, JwtService]
})
export class AuthModule {}