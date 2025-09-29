import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { UserRepository } from "src/DB/models/User/user.repository";
export const tokenTypes = {
    access: 'access',
    refresh: 'refresh'
}
@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService,
        private readonly userRepository: UserRepository
    ) { }

    sign(payload: object, options: JwtSignOptions) {
        return this.jwtService.sign(
            payload,
            options
        )
    }
    verify(token: string, options: JwtSignOptions) {
        return this.jwtService.verify(token, options)
    }
    async decodeToken(authorization: string) {
        try {
            const token = authorization
            if (!token) {
                throw new BadRequestException(`In-valid token`);
            }
            

            const decoded = this.verify( token , { secret: process.env.JWT_SECRET });
            if (!decoded?.id) {
                throw new BadRequestException(`In-valid token payload`);
            }
            const user = await this.userRepository.findOne({ _id: decoded?.["id"] })
            if (!user) {
                throw new NotFoundException("User not found");
            }
            if (user.changeCredentialsTime?.getTime() >= (decoded?.iat * 1000)) {
                throw new UnauthorizedException("User changed his credentials, please login again");
            }
            return user
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}