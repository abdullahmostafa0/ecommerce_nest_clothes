import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { Role } from "src/common/Decorator/role.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { SubCategoryService } from "./subCategory.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/common/Utility/multer";
import { CloudInterceptor } from "src/common/Interceptors/cloud.interceptor";
import { Request } from "express";
import { CreateDTO } from "./dto";
import { Types } from "mongoose";
import { Public } from "src/common/Decorator/public.decorator";

@Controller("dashboard/subCategory")
@Role(["admin"])
@UseGuards(AuthGuard, RoleGuard)
export class SubCategoryController {
    constructor(private readonly categoryService: SubCategoryService) { }

    @UseInterceptors(FileInterceptor('image', multerOptions()), CloudInterceptor)
    @Post(':id')
    async create(
        @Body() createDTO: CreateDTO,
        @Req() req: Request,
        @Param("id") id: Types.ObjectId
    ) {
        const category = await this.categoryService.create(id, createDTO, req);

        return { message: "Done", category }
    }


    @UseInterceptors(FileInterceptor('image', multerOptions()), CloudInterceptor)
    @Patch(':id')
    async update(
        @Body() createDTO: CreateDTO,
        @Req() req: Request,
        @Param("id") id: Types.ObjectId
    ) {
        const updated = await this.categoryService.update(id, createDTO, req);

        return { message: "Done", updated }
    }

    @Public("public")
    @Get()
    async get(
    ) {
        const subCategories = await this.categoryService.get();

        return { message: "Done", subCategories }
    }

    @Delete(":id")
    async delete(
        @Param("id") id: Types.ObjectId
    ) {
        const deleted = await this.categoryService.delete(id);

        return { message: "Done", deleted }
    }
}