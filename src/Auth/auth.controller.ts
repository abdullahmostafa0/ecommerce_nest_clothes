
import { Body, Controller, Get, Post, Req, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { confirmDTO, forgetPasswordDTO, resendDTO, resetPasswordDTO, signinDTO, signupDTO } from "./dto";
import { signupSchema, signupType } from "./schemas/schema";
import { ZodValidationPipe } from "src/common/Pipes/zod.validation.pipe";
import { Request } from "express";

@UsePipes(ValidationPipe)
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    @Post("signup")
    async signup(@Body() body: signupDTO) { 
        const createdUser = await this.authService.signup(body);
        return {message:"User created successfully", data: createdUser};

    }
    
    @Post("signin")
    async signin(@Body() body: signinDTO) {
        const user = await this.authService.signin(body);
        return {message:"User signed in successfully", data: user};
    }

    

    @Post("resend-otp")
    async resend(@Body() body: resendDTO) {
        const user = await this.authService.resend(body);
        return {message:"Done"};
    }

    @Post("forget-password")
    async forgetPassword(@Body() body: forgetPasswordDTO) {
        const user = await this.authService.forgetPassword(body);
        return {message:"Done"};
    }

    @Post("reset-password")
    async resetPassword(@Body() body: resetPasswordDTO) {
        const user = await this.authService.resetPassword(body);
        return {message:"Done"};
    }

    

}