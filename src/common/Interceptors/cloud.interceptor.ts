import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, throwError } from "rxjs";
import { CloudService } from "../service/cloud.service";

@Injectable()
export class CloudInterceptor implements NestInterceptor {
    constructor(private readonly cloudService: CloudService) { }
    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {

        const request = context.switchToHttp().getRequest();
        const file = request.file as Express.Multer.File;
        if (file) {
            try {
                const folderId = Math.ceil(Math.random() * 10000 + 9999).toString()

                const { secure_url, public_id } = await this.cloudService.uploadFile(
                    {
                        path: file.path,
                        folder: folderId
                    })
                request.body.image = { secure_url, public_id, folderId }
            } catch (error) {
                console.error('Error uploading file to cloud:', error);
                throw error;
            }
        }
        return next.handle().pipe(
            catchError(async (err)=>{
                try {
                    if (request.body.image?.folderId) {
                        await this.cloudService.deleteFolder(request.body.image.folderId)
                    }
                } catch (deleteError) {
                    console.error('Error deleting folder:', deleteError)
                }
                return throwError(()=>err)
            })
        )
    }

}

