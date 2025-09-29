import { Injectable } from "@nestjs/common";
import cloudinary from "../config/cloud.config";
import { IImage } from "src/DB/models/Category/category.model";
interface IUploadFileOptions {
    path: string,
    public_id?: string,
    folder?: string
}
@Injectable()
export class CloudService {
    async uploadFile({ path, public_id, folder }: IUploadFileOptions) {
        return await cloudinary.uploader.upload(path, { folder, public_id })
    }

    async uploadFiles(files: Express.Multer.File[], folder: string) {
        const image: IImage[] = []
        for (const file of files) {
            const { secure_url, public_id } = await this.uploadFile({
                path: file.path,
                public_id: file.originalname,
                folder
            })
            image.push({
                secure_url,
                public_id
            })
        }
        return image
    }
    async deleteFile(public_id: string) {
        return await cloudinary.uploader.destroy(public_id)
    }

    async deleteFiles(public_id: string[]) {
        for(let i = 0; i < public_id.length; i++) {
            await this.deleteFile(public_id[i])
        }
    }
    

    async deleteFolderResource(path: string) {
        return await cloudinary.api.delete_resources_by_prefix(path)
    }

    async deleteFolder(path: string)
    {
        await this.deleteFolderResource(path)
        return await cloudinary.api.delete_folder(path)
    }
}