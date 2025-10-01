import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { Role } from "src/common/Decorator/role.decorator";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { CategoryService } from "./category.service";
import {  CreateCategoryDTO, UpdateCategorDTO } from "./dto";
import { multerOptions } from "src/common/Utility/multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudInterceptor } from "src/common/Interceptors/cloud.interceptor";
import { Types } from "mongoose";
import { Request } from "express";
import { Public } from "src/common/Decorator/public.decorator";

@Controller("dashboard/category")
@Role(["superAdmin"])
@UseGuards(AuthGuard, RoleGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }
    @UseInterceptors(FileInterceptor('image', multerOptions()), CloudInterceptor)
    @Post()
    async create(
        @Body() categoryDTO: CreateCategoryDTO,
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File
    ) {

        const category = await this.categoryService.create(
            categoryDTO,
            req["user"],
            file
        );
        return {message:"Done", data:category}
    }

    @Put(":id")
    @UseInterceptors(FileInterceptor('image', multerOptions()))
    async update(
        @Param("id") id: Types.ObjectId,
        @Body() updateCategoryDTO: UpdateCategorDTO,
        @Req() req: Request
    ) {
        const category = await this.categoryService.update(
            id,
            updateCategoryDTO,
            req
        );
        return {
            message: "Done",
            data:category
        }
    }
    @Public("public")
    @Get()
    async getAll() {
        const categories = await this.categoryService.getAll();
        return {
            message: "Done",
            data: categories
        }
    }

    @Delete(":id")
    async deleteCategroy(@Param("id") id: Types.ObjectId) {
        const category = await this.categoryService.deleteCategory(id);
        return {
            message: "Done",
            data: category
        }
    }
}