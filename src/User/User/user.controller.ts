import { Controller, Delete, Get, Param, Patch, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { Role } from "src/common/Decorator/role.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { UserService } from "./user.service";
import { Types } from "mongoose";
import { Public } from "src/common/Decorator/public.decorator";


@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller("user")
@Role(["user"])
@UseGuards(AuthGuard, RoleGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Patch("add-to-favorite/:id")
    async addToFavorite(
        @Param("id") id: Types.ObjectId,
        @Req() req: Request) {
        const user = await this.userService.addToFavorite(id, req)
        return {
            message: 'Done',
            user
        }
    }

    @Delete("remove-from-favorite/:id")
    async removeFromFavorite(
        @Param("id") id: Types.ObjectId,
        @Req() req: Request) {
        const user = await this.userService.removeFromFavorite(id, req)
        return {
            message: 'Done',
            user
        }
    }

    @Get("get-favorite")
    async getFavorite(
        @Req() req: Request) {
        const user = await this.userService.getFavorite(req)
        return {
            message: 'Done',
            user
        }
    }
    @Role(["user", "admin", "superAdmin"])
    @Get("profile")
    async getProfile(@Req() req: Request) {
        const user = await this.userService.getProfile(req)
        return {
            message: 'Done',
            user
        }
    }
    
}