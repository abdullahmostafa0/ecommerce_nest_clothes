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
                const { secure_url, public_id } = await this.cloudService.uploadFile({
                    path: file.path,
                })
                request.body.image = { secure_url, public_id }
            } catch (error) {
                console.error('Error saving file:', error);
                throw error;
            }
        }
        return next.handle().pipe(
            catchError(async (err) => {
                try {
                    if (request.body.image?.public_id) {
                        await this.cloudService.deleteFile(request.body.image.public_id)
                    }
                } catch (deleteError) {
                    console.error('Error deleting file:', deleteError)
                }
                return throwError(() => err)
            })
        )
    }
}

