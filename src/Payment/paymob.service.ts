import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { OrderRepository } from "src/DB/models/Order/order.repository";
import { OrderStatus } from "src/User/Order/order.interface";
import { OrderService } from "src/User/Order/order.service";
import * as crypto from "crypto";

interface PaymobAuthResponse {
    token: string;
}

interface PaymobOrderResponse {
    id: number; // paymob order id
}

interface PaymobPaymentKeyResponse {
    token: string;
}

@Injectable()
export class PaymobService {
    private readonly baseUrl = "https://accept.paymob.com/api";

    constructor(
        private readonly orderRepository: OrderRepository,
    ) { }

    private async postJson<T>(url: string, body: unknown): Promise<T> {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
            }
            return await res.json() as T;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async authenticate(): Promise<string> {
        const apiKey = process.env.PAYMOB_API_KEY as string;
        const data = await this.postJson<PaymobAuthResponse>(
            `${this.baseUrl}/auth/tokens`,
            { api_key: apiKey }
        );
        return data.token;
    }

    async registerOrder(authToken: string, merchantOrderId: string, amountCents: number): Promise<number> {
        const data = await this.postJson<PaymobOrderResponse>(
            `${this.baseUrl}/ecommerce/orders`,
            {
                auth_token: authToken,
                delivery_needed: false,
                amount_cents: amountCents,
                currency: "EGP",
                merchant_order_id: merchantOrderId,
                items: []
            }
        );
        return data.id;
    }

    async generatePaymentKey(
        authToken: string,
        amountCents: number,
        paymobOrderId: number,
        billingData: Record<string, string>
    ): Promise<string> {
        const integrationId = Number(process.env.PAYMOB_INTEGRATION_ID);
        const data = await this.postJson<PaymobPaymentKeyResponse>(
            `${this.baseUrl}/acceptance/payment_keys`,
            {
                auth_token: authToken,
                amount_cents: amountCents,
                expiration: 3600,
                order_id: paymobOrderId,
                billing_data: {
                    apartment: "NA",
                    floor: "NA",
                    street: billingData["street"] || "NA",
                    building: "NA",
                    phone_number: billingData["phone_number"] || "NA",
                    shipping_method: "NA",
                    postal_code: billingData["postal_code"] || "NA",
                    city: billingData["city"] || "NA",
                    country: billingData["country"] || "EG",
                    state: billingData["state"] || "NA",
                    email: billingData["email"] || "user@example.com",
                    first_name: billingData["first_name"] || "User",
                    last_name: billingData["last_name"] || "",
                },
                currency: "EGP",
                integration_id: integrationId,
                lock_order_when_paid: true
            }
        );
        return data.token;
    }

    getIframeUrl(paymentToken: string): string {
        const iframeId = process.env.PAYMOB_IFRAME_ID as string;
        return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
    }

    private computeHmac(payload: any): string {
        const secret = process.env.PAYMOB_HMAC_SECRET as string;
        // Per Paymob docs, build the concatenated string from specific fields in a strict order
        // Here, we use the common TRANSACTION fields order
        const t = payload?.obj || {};
        const concat = `${t.amount_cents}${t.created_at}${t.currency}${t.error_occured}${t.has_parent_transaction}${t.id}${t.integration_id}${t.is_3d_secure}${t.is_auth}${t.is_capture}${t.is_refunded}${t.is_standalone_payment}${t.is_voided}${t.order?.id}${t.owner}${t.pending}${t.source_data?.pan}${t.source_data?.sub_type}${t.source_data?.type}${t.success}`;
        return crypto.createHmac("sha512", secret).update(concat).digest("hex");
    }

    async webhook(body: any, hmac: string) {
        try {
            // Verify type and hmac
            if (body?.type !== "TRANSACTION") {
                throw new BadRequestException("Unsupported webhook type");
            }
            const expected = this.computeHmac(body);
            if (!hmac || hmac.toLowerCase() !== expected.toLowerCase()) {
                throw new BadRequestException("Invalid HMAC signature");
            }

            if (body.obj.success != true) {
                throw new BadRequestException("Payment failed")
            }
            // Idempotent update: update only if still pending
            await this.orderRepository.updateOne(
                { intentId: String(body.obj.order.id), status: OrderStatus.pending },
                { status: OrderStatus.placed, paidAt: new Date() }
            );
            return { ok: true };
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }
}


