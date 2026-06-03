import { Body, Controller, Get, Headers, Post, Query, Redirect, Req, Res } from "@nestjs/common";
import { Public } from "src/common/Decorator/public.decorator";
import { Request, Response } from "express";
import { PaymobService } from "./paymob.service";

@Controller("paymob")
export class PaymobController {
    constructor(private readonly paymobService: PaymobService) { }
    
    @Public("public")
    @Post("webhook")
    async webhook(
        @Body() body: any, 
        @Query("hmac") hmacQuery?: string,
        @Req() req?: Request
    ) {
        // Paymob can send HMAC in query params or headers
        // Try query param first, then header
        const hmac = hmacQuery || ""
        
        
        await this.paymobService.webhook(body, hmac);
        return { ok: true };
    }

    @Public("public")
    @Get("webhook")
    async responseCallback(@Query() query: any, @Res() res: Response) {
        // This handles the GET request when user is redirected back after payment
        const success = query.success === "true";
        const orderId = query.merchant_order_id;
        
        // Redirect to your frontend with the result
        const frontendUrl = process.env.FRONTEND_URL || "https://extrachic.cloud";
        const redirectUrl = `${frontendUrl}/payment/${success ? 'success' : 'failed'}?orderId=${orderId}`;
        
        return res.redirect(frontendUrl);
    }
}


