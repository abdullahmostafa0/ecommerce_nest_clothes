
import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { UserRepository } from "src/DB/models/User/user.repository";
import { TokenService } from "../service/token.service";
import { Reflector } from "@nestjs/core";
import { Public } from "../Decorator/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private tokenService: TokenService,
        private userRepository: UserRepository,
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = this.getRequest(context);
            const authorization = this.getAuthorization(context)

            const publicValue = this.reflector.getAllAndMerge(Public,
                [
                    context.getHandler(),
                    context.getClass()
                ]
            )
            if (publicValue[0] == 'public') {
                return true
            }
            const user = await this.tokenService.decodeToken(authorization)
            request.user = user;
            return true;
        } catch (error) {
            throw error;
        }
    }
    private getAuthorization(context: ExecutionContext) {
        switch (context['contextType']) {
            case 'http':
                return context.switchToHttp().getRequest().headers.authorization
            case 'ws':
                return context.switchToWs().getClient().handshake?.headers?.authorization ||
                    context.switchToWs().getClient().handshake?.auth?.authorization

        }
    }

    private getRequest(context: ExecutionContext) {
        switch (context['contextType']) {
            case 'http':
                return context.switchToHttp().getRequest()
            case 'ws':
                return context.switchToWs().getClient()
        }
    }

}