import { diskStorage } from "multer"
import { extname, join } from "path"
import { existsSync, mkdirSync } from "fs"

export const multerOptions = () => {
    const uploadDir = join(process.cwd(), 'uploads', 'images')
    if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true })
    }
    return {
        storage: diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadDir)
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
                const ext = extname(file.originalname)
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
            }
        }),
        fileFilter: function (req, file, cb) {
            cb(null, true)
        }
    }
}