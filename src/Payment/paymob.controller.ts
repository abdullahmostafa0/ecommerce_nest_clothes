import { Body, Controller, Post, Query, Req } from "@nestjs/common";
import { Public } from "src/common/Decorator/public.decorator";
import { Request } from "express";
import { PaymobService } from "./paymob.service";

@Controller("paymob")
export class PaymobController {
    constructor(private readonly paymobService: PaymobService) {}
    @Public("public")
    @Post("webhook")
    async webhook(@Req() req: Request, @Body() body: any, @Query("hmac") hmac?: string) {
        await this.paymobService.webhook(req.body, hmac || "");
        return { ok: true };
    }
}


