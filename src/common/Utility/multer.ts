import { diskStorage } from "multer"

export const multerOptions = ()=>{
    return {
        storage: diskStorage({}),
        fileFilter: function (req, file, cb) {
            cb(null, true)
        }
    }
}