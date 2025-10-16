/* eslint-disable prefer-const */
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, Type } from "@nestjs/common";
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
        try {
            
            
            const { nameArabic, nameEnglish } = createCategoryDTO;
            // Check if nameArabic already exists
            const categoryExistArabic = await this.findOne({ nameArabic });
            if (categoryExistArabic) {
                throw new ConflictException("Category with this Arabic name already exists")
            }
            // Check if nameEnglish already exists
            const categoryExistEnglish = await this.findOne({ nameEnglish });
            if (categoryExistEnglish) {
                throw new ConflictException("Category with this English name already exists")
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
            const category = {
                nameArabic,
                nameEnglish,
                createdBy: user.id as Types.ObjectId,
                image: createCategoryDTO.image ? {
                    secure_url: createCategoryDTO.image.secure_url,
                    public_id: createCategoryDTO.image.public_id
                } : undefined,
                folderId: createCategoryDTO.image?.folderId

            };
            const categoryCreated = await this.categoryRepository.create(category);
            return categoryCreated;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async update(
        id: Types.ObjectId,
        updateCategoryDTO: UpdateCategorDTO,
        req: Request
    ) {
        try {
            const category = await this.categoryRepository.findOne({ _id: id })
            if (!category) {
                throw new NotFoundException("category not found")
            }
            const { nameArabic, nameEnglish } = updateCategoryDTO
            
            // Check if nameArabic already exists (excluding current category)
            if (nameArabic) {
                const nameExistArabic = await this.findOne({ 
                    nameArabic, 
                    _id: { $ne: id } 
                });
                if (nameExistArabic) {
                    throw new ConflictException("Category with this Arabic name already exists")
                }
            }
            
            // Check if nameEnglish already exists (excluding current category)
            if (nameEnglish) {
                const nameExistEnglish = await this.findOne({ 
                    nameEnglish, 
                    _id: { $ne: id } 
                });
                if (nameExistEnglish) {
                    throw new ConflictException("Category with this English name already exists")
                }
            }
            const { file } = req
            if (file) {
                if (category.image?.public_id) {
                    const { secure_url } = await this.cloudService.uploadFile(
                        {
                            path: file.path,
                            public_id: category.image.public_id,
                        }
                    )
                    category.image.secure_url = secure_url
                } else {
                    // If no existing image, create new one
                    const { secure_url, public_id } = await this.cloudService.uploadFile(
                        {
                            path: file.path,
                            public_id: file.originalname,
                        }
                    )
                    category.image = { secure_url, public_id }
                }
            }
            category.nameArabic = nameArabic || category.nameArabic
            category.nameEnglish = nameEnglish || category.nameEnglish
            return await category.save()
        } catch (error) {
            throw new InternalServerErrorException(error)
        }


    }

    async getAll(): Promise<typeCategory[] | [] | IPaginate<typeCategory>> {

        try {
            const categories = await this.categoryRepository.findAll({
                population: [{ path: "createdBy" }, { path: "subCategories" }]
            })
            return categories
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async deleteCategory(id: Types.ObjectId): Promise<DeleteResult> {
        try {
            const category = await this.categoryRepository.findOne({ _id: id })
            if (!category) {
                throw new NotFoundException("category not found")
            }
            const updated = await this.productRepository.updateMany(
                { category: id }, { category: null })

            if (category.image?.public_id) {
                await this.cloudService.deleteFile(category.image.public_id)
            }
            const deleted = await this.categoryRepository.deleteOne({ _id: id })

            return deleted
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }
}