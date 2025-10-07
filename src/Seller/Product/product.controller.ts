import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { AddVariantDTO, CreateProductDTO, EditVariantDTO, ProductFilterDTO, ProductIdDTO, UpdateProductDTO } from "./DTO";
import { FileFieldsInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/common/Utility/multer";
import { Request } from "express";
import { AuthGuard } from "src/common/Guards/auth.guard";
import { RoleGuard } from "src/common/Guards/role.guard";
import { Role } from "src/common/Decorator/role.decorator";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { Types } from "mongoose";
import { Public } from "src/common/Decorator/public.decorator";

@Controller('product')
@Role(["superAdmin"])
@UseGuards(AuthGuard, RoleGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 6 }
    ] ,multerOptions()))
    async create(
        @Body() createProductDTO: CreateProductDTO,
        @Req() req: Request,
        @UploadedFiles() files: { mainImage?: Express.Multer.File[], subImages?: Express.Multer.File[] }) {
        const product = await this.productService.create(createProductDTO, req, files)
        return {
            message: 'Product created successfully',
            product
        }
    }


    @Patch(":productId")
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 6 }
    ] ,multerOptions()))
    async update(
        @Body() updateProductDTO: UpdateProductDTO,
        @Req() req: Request,
        @Param() params: ProductIdDTO,
        @UploadedFiles() files: { mainImage?: Express.Multer.File[], subImages?: Express.Multer.File[] }
    ) {
        const product = await this.productService.update(updateProductDTO, req, params.productId)
        return {
            message: 'Product updated successfully',
            product
        }
    }

    @Public("public")
    @Get()
    @CacheTTL(20)
    async findAll(
        @Query() productFilterDTO: ProductFilterDTO,
    ) {
        return await this.productService.findAll(productFilterDTO)
    }
    @UseInterceptors(CacheInterceptor)
    @Get("all")
    async all() {
        const products = await this.productService.all()
        return {
            message: 'Done',
            products
        }
    }
    @Delete(":id")
    async delete(@Param("id") id: Types.ObjectId) {
        const product = await this.productService.delete(id)
        return {
            message: 'Done',
            product
        }
    }

    @Post(":id")
    async addVariant(
        @Param("id") id: Types.ObjectId, 
        @Body() addVariantDTO: AddVariantDTO) {
        const product = await this.productService.addVariant(id, addVariantDTO)
        return {
            message: 'Done',
            product
        }
    }

    @Patch(":id/editVariant")
    async editVariant(
        @Param("id") id: Types.ObjectId, 
        @Body() editVariantDTO: EditVariantDTO) {
        const product = await this.productService.editVariant(id, editVariantDTO)
        return {
            message: 'Done',
            product
        }
    }

    

    @Public("public")
    @Get("best-selling")
    async getBestSelling() {
        const products = await this.productService.getBestSelling()
        return {
            message: 'Done',
            products
        }
    }

    @Public("public")
    @Get("withId/:id")
    async getProduct(@Param("id") id: Types.ObjectId) {
        const product = await this.productService.getProduct(id)
        return {
            message: 'Done',
            product
        }
    }




}