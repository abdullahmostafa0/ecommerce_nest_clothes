/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { confirmDTO, resendDTO, resetPasswordDTO, signinDTO, signupDTO } from "./dto";
import { UserRepository } from "../DB/models/User/user.repository";
import { compare, hash } from "src/common/security/password.security";
import { TypeUser } from "src/DB/models/User/user.model";
import { sendEmail } from "src/common/Utility/sendEmail";
import { TokenService, tokenTypes } from "src/common/service/token.service";
import { UpdateWriteOpResult } from "mongoose";
import { emailEvent } from "src/common/Utility/email.event";
import { UserRole } from "src/common/enums";
import { Request } from "express";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
    ) { }

    async signup(body: signupDTO): Promise<TypeUser> {
        const { name, email, password, phone, address } = body
        const userExist = await this.userRepository.findByEmail(email)
        if (userExist) {
            throw new ConflictException('User already exist')
        }
        const user = await this.userRepository.create(
        { name, email, password: hash(password),
                phone, address, role: UserRole.USER
        })


        return user

    }



    async signin(body: signinDTO): Promise<{ accessToken: string, user}> {

        const { email, password } = body
        const user = await this.userRepository.findByEmail(email)
        if (!user) {
            throw new NotFoundException('User not found')
        }
        if (!compare(password, user.password)) {
            throw new BadRequestException('Password is not correct')
        }
        
        const accessToken = this.tokenService.sign({ id: user.id }, { secret: process.env.JWT_SECRET, expiresIn: '3d' })
        
        return {accessToken: accessToken, user} 

    }

    resend(body: resendDTO) {

        const { email } = body;
        const code = Math.floor(1000 + Math.random() * 900000);
        const user  =  this.userRepository.updateOne(
            { email: email },
            { emailOtp: hash(code.toString()) }
        );
        emailEvent.emit('sendEmail', { email, code });
        return user
    }

    async forgetPassword(body: resendDTO) {

        const { email } = body;
        const code = Math.floor(1000 + Math.random() * 900000);
        const user  =  await this.userRepository.updateOne(
            { email: email },
            { emailOtp: hash(code.toString()) }
        );
        emailEvent.emit('resetPassword', { email, code });
        return user
    }

    async resetPassword(body: resetPasswordDTO) {

        const { email , otp, password} = body;
        const userExist = await this.userRepository.findByEmail(email)
        if (!userExist) {
            throw new NotFoundException('User is not exist')
        }
        if (!compare(otp, userExist.emailOtp)) {
            throw new BadRequestException("In-valid OTP")
        }
        const user  =  await this.userRepository.updateOne(
            { email: email },
            { 
                password: hash(password), 
                $unset: { emailOtp: 0 }, 
                changeCredentialsTime: new Date() 
            }
        );
        
        return user
    }

    
}

