import { Body, Controller, Post, Query, Req } from "@nestjs/common";
import { Public } from "src/common/Decorator/public.decorator";
import { Request } from "express";
import { PaymobService } from "./paymob.service";

@Controller("paymob")
export class PaymobController {
    constructor(private readonly paymobService: PaymobService) {}
    @Public("public")
    @Post("webhook")
    async webhook(@Req() req: Request, @Query("hmac") hmac?: string) {
        // Parse the raw buffer body as JSON
        const body = JSON.parse(req.body.toString());
        await this.paymobService.webhook(body, hmac || "");
        return { ok: true };
    }
}


