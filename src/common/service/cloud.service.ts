import { Injectable } from "@nestjs/common";
import { IImage } from "src/DB/models/Category/category.model";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";

interface IUploadFileOptions {
    path: string,
    public_id?: string,
    folder?: string
}

@Injectable()
export class CloudService {
    private getRelativeUrl(filePath: string): string {
        const cwd = process.cwd().replace(/\\/g, '/')
        const normalized = filePath.replace(/\\/g, '/')
        if (normalized.startsWith(cwd)) {
            const relative = normalized.substring(cwd.length) // e.g. /uploads/images/file.jpg
            // Prefix with /api so it goes through the Nginx proxy
            return '/api' + relative
        }
        return '/api' + normalized
    }

    async uploadFile({ path }: IUploadFileOptions): Promise<{ secure_url: string; public_id: string }> {
        const relativeUrl = this.getRelativeUrl(path)
        return {
            secure_url: relativeUrl,
            public_id: relativeUrl
        }
    }

    async uploadFiles(files: Express.Multer.File[], folder: string): Promise<IImage[]> {
        const images: IImage[] = []
        for (const file of files) {
            const { secure_url, public_id } = await this.uploadFile({ path: file.path })
            images.push({ secure_url, public_id })
        }
        return images
    }

    async deleteFile(publicId: string): Promise<void> {
        try {
            // Strip /api prefix if present (public_id stored as /api/uploads/...)
            const cleanId = publicId.startsWith('/api/') ? publicId.substring(4) : publicId
            const fullPath = join(process.cwd(), cleanId)
            if (existsSync(fullPath)) {
                unlinkSync(fullPath)
            }
        } catch (error) {
            console.error('Error deleting file:', error)
        }
    }

    async deleteFiles(publicIds: string[]): Promise<void> {
        for (const id of publicIds) {
            await this.deleteFile(id)
        }
    }

    async deleteFolderResource(path: string): Promise<void> {
        // No-op for local storage
    }

    async deleteFolder(path: string): Promise<void> {
        // No-op for local storage
    }
}