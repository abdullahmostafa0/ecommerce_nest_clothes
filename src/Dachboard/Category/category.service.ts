/* eslint-disable prefer-const */
import { ConflictException, Injectable, NotFoundException, Type } from "@nestjs/common";
import { CreateCategoryDTO, UpdateCategorDTO } from "./dto";
import { CategoryRepository } from "src/DB/models/Category/category.repository";
import { TypeUser } from "src/DB/models/User/user.model";
import { DeleteResult, FilterQuery, Types } from "mongoose";
import { typeCategory } from "src/DB/models/Category/category.model";
import { CloudService } from "src/common/service/cloud.service";
import { Request } from "express";
import slugify from "slugify";
import { IPaginate } from "src/DB/db.service";
import { ProductRepository } from "src/DB/models/Product/product.repository";

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly cloudService: CloudService,
        private readonly productRepository: ProductRepository,
    ) { }
    async findOne(filter: FilterQuery<typeCategory>) {
        const category = await this.categoryRepository.findOne(filter);
        return category;
    }
    async create(
        createCategoryDTO: CreateCategoryDTO,
        user: TypeUser,
        image: Express.Multer.File)
        : Promise<typeCategory> {

        const { nameArabic, nameEnglish } = createCategoryDTO;
        const categoryExist = await this.findOne({ nameArabic, nameEnglish});

        if (categoryExist) {
            throw new ConflictException("category already exist")
        }
        /*
        const folderId = Math.ceil(Math.random() * 10000 + 9999).toString()
        const { secure_url, public_id } = await this.cloudService.uploadFile(
            {
                path: image.path,
                public_id:image.originalname,
                folder: folderId
            })
            */
        console.log(createCategoryDTO.image)
        const category = {
            nameArabic,
            nameEnglish,
            createdBy: user.id as Types.ObjectId,
            image: {
                secure_url: createCategoryDTO.image?.secure_url,
                public_id: createCategoryDTO.image?.public_id
            },
            folderId: createCategoryDTO.image.folderId

        };
        const categoryCreated = await this.categoryRepository.create(category);

        return categoryCreated;
    }

    async update(
        id: Types.ObjectId,
        updateCategoryDTO: UpdateCategorDTO,
        req: Request
    ) {
        const category = await this.categoryRepository.findOne({ _id: id })
        if (!category) {
            throw new NotFoundException("category not found")
        }
        const { nameArabic, nameEnglish } = updateCategoryDTO
        if (nameEnglish || nameArabic) {
            const nameExist = await this.findOne({ nameEnglish, nameArabic })
            if (nameExist) {
                throw new ConflictException("Category name already exist")
            }

        }
        const { file } = req
        if (file) {
            const { secure_url } = await this.cloudService.uploadFile(
                {
                    path: file.path,
                    public_id: category.image.public_id,
                }
            )
            category.image.secure_url = secure_url
        }
        return await category.save()

    }

    async getAll(): Promise<typeCategory[] | [] | IPaginate<typeCategory>> {

        
        const categories = await this.categoryRepository.findAll({
            population: [{ path: "createdBy" }, { path: "subCategories" }]
        })
        return categories
    }

    async deleteCategory(id: Types.ObjectId): Promise<DeleteResult> {

        const category = await this.categoryRepository.findOne({ _id: id })
        if (!category) {
            throw new NotFoundException("category not found")
        }
        const updated = await this.productRepository.updateMany({ category: id }, { category: null })
        console.log(updated)
        if (category.image?.public_id) {
            await this.cloudService.deleteFile(category.image.public_id)
        }
        const deleted = await this.categoryRepository.deleteOne({ _id: id })

        return deleted
    }
}