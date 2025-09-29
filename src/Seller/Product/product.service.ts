/* eslint-disable prefer-const */
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CloudService } from "src/common/service/cloud.service";
import { ProductRepository } from "src/DB/models/Product/product.repository";
import { AddVariantDTO, CreateProductDTO, EditVariantDTO, ProductFilterDTO, UpdateProductDTO } from "./DTO";
import { Request } from "express";
import { CategoryService } from "src/Dachboard/Category/category.service";
import { IImage } from "src/DB/models/Category/category.model";
import { DeleteResult, FilterQuery, Types, UpdateWriteOpResult } from "mongoose";
import { CategoryRepository } from "src/DB/models/Category/category.repository";
import { discountTypeEnum, productType } from "src/DB/models/Product/product.model"
import { calculateFinalPrice } from "src/common/Utility/finalPrice";
import slugify from "slugify";
import { IPaginate } from "src/DB/db.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CartRepository } from "src/DB/models/Cart/cart.repository";
import { UserRepository } from "src/DB/models/User/user.repository";
@Injectable()
export class ProductService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly productRepository: ProductRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly cloudService: CloudService,
        private readonly cartRepository: CartRepository,
        private readonly userRepository: UserRepository
    ) { }

    async create(createProductDTO: CreateProductDTO, req: Request,
        files?: { mainImage?: Express.Multer.File[], subImages?: Express.Multer.File[] }
    ) {
        try {
            const {
                titleArabic,
                titleEnglish,
                descriptionEnglish,
                descriptionArabic,
                price,
                category,
                discount,
                discountType,
                variants } = createProductDTO;
            const categoryExist = await this.categoryRepository.findOne({ _id: category })
            if (!categoryExist) {
                throw new NotFoundException("Category not found")
            }
            const categoryFolderId = categoryExist.folderId;
            const folderId = Math.ceil(Math.random() * 10000 + 9999).toString()

            let subImages: IImage[] = []
            let mainImage: IImage
            //console.log(req.files)
            const mainFile = files?.mainImage?.[0]
            if (mainFile) {
                mainImage = await this.cloudService.uploadFile({
                    path: mainFile.path, // or use buffer if using memory storage
                    public_id: mainFile.originalname,
                    folder: `${process.env.APP_NAME}/category/${categoryFolderId}/product/${folderId}`
                })
            } else {
                // mainImage is required by schema — throw or make it optional in schema
                throw new BadRequestException('mainImage file is required')
            }

            // handle subImages (optional)
            if (files?.subImages?.length) {
                for (const f of files.subImages) {
                    const uploaded = await this.cloudService.uploadFile({
                        path: f.path,
                        public_id: f.originalname,
                        folder: `${process.env.APP_NAME}/category/${categoryFolderId}/product/${folderId}`
                    })
                    subImages.push(uploaded)
                }
            }
            let parsedVariants = createProductDTO.variants;
            if (typeof parsedVariants === 'string') {
                try { parsedVariants = JSON.parse(parsedVariants); }
                catch { throw new BadRequestException('Invalid variants JSON'); }
            }
            const product = await this.productRepository.create({
                titleArabic,
                titleEnglish,
                descriptionArabic,
                descriptionEnglish,
                price,
                category,
                discount,
                discountType,
                variants: parsedVariants,
                subImages,
                mainImage,
                folderId,
                createdBy: req["user"]._id as Types.ObjectId,
                updatedBy: req["user"]._id as Types.ObjectId,
            })
            return product;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async update(updateProductDTO: UpdateProductDTO, req: Request, id: Types.ObjectId,
        files?: { mainImage?: Express.Multer.File[], subImages?: Express.Multer.File[] }
    ) {
        try {
            const {
                titleArabic,
                titleEnglish,
                descriptionEnglish,
                descriptionArabic,
                price,
                category,
                discount,
                discountType,
                variants } = updateProductDTO;

            const product = await this.productRepository.findOne({ _id: id })
            if (!product) {
                throw new NotFoundException("Product not found")
            }
            let categoryFolderId: string = ""
            if (updateProductDTO.category) {
                const categoryExist = await this.categoryRepository.findOne({ _id: category })
                if (!categoryExist) {
                    throw new NotFoundException("Category not found")
                }
                categoryFolderId = categoryExist.folderId
            }



            let subImages: IImage[] = []
            let mainImage: IImage = product.mainImage
            //console.log(req.files)
            const mainFile = files?.mainImage?.[0]
            if (mainFile) {
                mainImage = await this.cloudService.uploadFile({
                    path: mainFile.path, // or use buffer if using memory storage
                    public_id: mainFile.originalname,
                    folder: `${process.env.APP_NAME}/category/${categoryFolderId}/product/${product.folderId}`
                })
            }

            // handle subImages 
            if (files?.subImages?.length) {
                for (const f of files.subImages) {
                    const uploaded = await this.cloudService.uploadFile({
                        path: f.path,
                        public_id: f.originalname,
                        folder: `${process.env.APP_NAME}/category/${categoryFolderId}/product/${product.folderId}`
                    })
                    subImages.push(uploaded)
                }
            }
            let finalPrice: number = product.finalPrice

            if (price || discount) {
                finalPrice = calculateFinalPrice(
                    price || product.price,
                    discount || product.discount,
                    discountType || product.discountType)

            }


            const productUpdated = await this.productRepository.findOneAndUpdate({ _id: id }, {
                titleArabic,
                titleEnglish,
                descriptionArabic,
                descriptionEnglish,
                price,
                category,
                discount,
                discountType,
                variants,
                mainImage,
                subImages,
                finalPrice,
                updatedBy: req["user"]._id as Types.ObjectId,
            })
            if (productUpdated &&
                (files?.mainImage?.length || files?.subImages?.length)
                && (product.subImages.length || product.mainImage)) {
                const ids = product.subImages.map((ele) => ele.public_id)
                await this.cloudService.deleteFiles(ids)
                await this.cloudService.deleteFile(product.mainImage.public_id)
            }
            return productUpdated;

        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async findAll(query: ProductFilterDTO): Promise<{
        message: string,
        data: productType[] | [] | IPaginate<productType>
    }> {
        let cacheName = 'products'
        if (Object.keys(query)?.length) {
            cacheName = JSON.stringify(query)
        }
        const cachedData = await this.cacheManager.get(cacheName)
        if (cachedData) {
            return { message: 'Done-Cached', data: JSON.parse(cachedData as string) }
        }



        let filter: FilterQuery<productType> = {}
        if (query.name) {
            filter = {
                $or: [
                    { name: { $regex: `${query.name}`, $options: 'i' } },
                ]
            }
        }
        if (query.maxPrice || query.minPrice) {
            const max = query.maxPrice ? { $lte: query.maxPrice } : {}
            filter.finalPrice = {
                $gte: query.minPrice || 0, ...max
            }
        }

        const products = await this.productRepository.findAll({
            filter,
            sort: query.sort,
            page: query.page,
            select: query.select,
            population: [{ path: "createdBy" }]
        })
        await this.cacheManager.set(cacheName, JSON.stringify(products))

        return { message: "Done", data: products };
    }

    async all(): Promise<productType[] | [] | IPaginate<productType>> {

        const products = await this.productRepository.findAll({

            population: [{ path: "createdBy" }]
        })
        return products;
    }

    async delete(id: Types.ObjectId): Promise<DeleteResult> {

        const product = await this.productRepository.findOne({ _id: id })
        if (!product) {
            throw new NotFoundException("Product not found")
        }
        if (product.subImages.length || product.mainImage) {
            const ids = product.subImages.map((ele) => ele.public_id)
            await this.cloudService.deleteFile(product.mainImage.public_id)
            await this.cloudService.deleteFiles(ids)
        }
        await this.cartRepository.updateMany(
            { "products.productId": id },
            {
                $pull: {
                    products: { productId: id },
                },
            })
        const deleted = await this.productRepository.deleteOne({ _id: id })

        return deleted;
    }

    async addVariant(id: Types.ObjectId, addVariantDTO: AddVariantDTO) {
        try {
            const product = await this.productRepository.findOne({ _id: id })
            if (!product) {
                throw new NotFoundException("Product not found")
            }
            product.variants.push(...addVariantDTO.variants)
            await product.save()
            return product;
        } catch (error) {
            const message = (error && (error as any).message) ? (error as any).message : 'Failed to add variants';
            // Convert known validation issues to 400 instead of 500
            if (
                message.includes('Duplicate') ||
                message.includes('validation') ||
                message.includes('ValidationError')
            ) {
                throw new BadRequestException(message)
            }
            throw new InternalServerErrorException(message)
        }

    }
    async editVariant(id: Types.ObjectId, editVariantDTO: EditVariantDTO) {

        try {
            const product = await this.productRepository.findOne({ _id: id })
            if (!product) {
                throw new NotFoundException("Product not found")
            }
            const variant = product.variants.find(
                (variant) => variant._id?.toString() === editVariantDTO.variantId.toString())
            if (!variant) {
                throw new NotFoundException("Variant not found")
            }
            const size = variant.size?.find(
                (size) => size._id?.toString() === editVariantDTO.sizeId.toString())
            if (!size) {
                throw new NotFoundException("Size not found")
            }

            await product.save()

            await this.productRepository.updateOne({ _id: id },
                {
                    $set: {
                        "variants.$[v].size.$[s].stock": editVariantDTO.stock,
                        "variants.$[v].size.$[s].size": editVariantDTO.size,
                        "variants.$[v].color": editVariantDTO.color
                    }
                },
                {
                    arrayFilters: [
                        { "v._id": editVariantDTO.variantId },
                        { "s._id": editVariantDTO.sizeId }
                    ]
                }
            )
            return product
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }


}