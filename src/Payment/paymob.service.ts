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
    private readonly baseUrl = "https://accept.paymob.com/v1";

    constructor(
        private readonly orderRepository: OrderRepository,
    ) { }

    private async postJson<T>(url: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headers
                },
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

    async createIntention(
        amountCents: number,
        currency: string,
        billingData: any,
        merchantOrderId: string
    ): Promise<any> {
        const secretKey = process.env.PAYMOB_SECRET_KEY as string;
        const publicKey = process.env.PAYMOB_PUBLIC_KEY as string;
        
        // Get integration ID from environment variable
        // For testing, use the test integration ID provided by Paymob: 5440446
        const integrationId = process.env.PAYMOB_INTEGRATION_ID || "5440446";

        const payload = {
            amount: amountCents,
            currency: currency,
            payment_methods: [Number(integrationId)],
            items: [],
            billing_data: {
                first_name: billingData.first_name || "User",
                last_name: billingData.last_name || "NA",
                phone_number: billingData.phone_number || "NA",
                email: billingData.email || "user@example.com"
            },
            special_reference: merchantOrderId
        };

        const data = await this.postJson<any>(
            `https://accept.paymob.com/v1/intention/`,
            payload,
            {
                "Authorization": `Token ${secretKey}`
            }
        );

        // Return the client secret and the constructed URL
        return {
            client_secret: data.client_secret,
            intention_id: data.id,
            url: `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${data.client_secret}`
        };
    }

    private computeHmac(payload: any): string {
        const secret = process.env.PAYMOB_HMAC_SECRET as string;
        if (!secret) {
            throw new Error("PAYMOB_HMAC_SECRET is not configured");
        }
        
        // Per Paymob docs, build the concatenated string from specific fields in a strict order
        // Here, we use the common TRANSACTION fields order
        const t = payload?.obj || {};
        
        // Handle undefined/null values by converting to empty string
        const amount_cents = t.amount_cents ?? '';
        const created_at = t.created_at ?? '';
        const currency = t.currency ?? '';
        const error_occured = t.error_occured ?? '';
        const has_parent_transaction = t.has_parent_transaction ?? '';
        const id = t.id ?? '';
        const integration_id = t.integration_id ?? '';
        const is_3d_secure = t.is_3d_secure ?? '';
        const is_auth = t.is_auth ?? '';
        const is_capture = t.is_capture ?? '';
        const is_refunded = t.is_refunded ?? '';
        const is_standalone_payment = t.is_standalone_payment ?? '';
        const is_voided = t.is_voided ?? '';
        const order_id = t.order?.id ?? '';
        const owner = t.owner ?? '';
        const pending = t.pending ?? '';
        const pan = t.source_data?.pan ?? '';
        const sub_type = t.source_data?.sub_type ?? '';
        const type = t.source_data?.type ?? '';
        const success = t.success ?? '';
        
        const concat = `${amount_cents}${created_at}${currency}${error_occured}${has_parent_transaction}${id}${integration_id}${is_3d_secure}${is_auth}${is_capture}${is_refunded}${is_standalone_payment}${is_voided}${order_id}${owner}${pending}${pan}${sub_type}${type}${success}`;
        
        return crypto.createHmac("sha512", secret).update(concat).digest("hex");
    }

    async webhook(body: any, hmac: string) {
        try {

            // Verify type
            if (body?.type !== "TRANSACTION") {
                console.log("❌ Invalid webhook type:", body?.type);
                throw new BadRequestException("Unsupported webhook type");
            }

            // HMAC validation - can be disabled for testing by setting PAYMOB_SKIP_HMAC=true
            const skipHmac = process.env.PAYMOB_SKIP_HMAC === "true";
            
            if (!skipHmac) {
                try {
                    const expected = this.computeHmac(body);
                    console.log("Expected HMAC:", expected);
                    
                    if (!hmac || hmac.toLowerCase() !== expected.toLowerCase()) {
                        console.log("❌ HMAC mismatch");
                        console.log("Received:", hmac?.toLowerCase());
                        console.log("Expected:", expected.toLowerCase());
                        throw new BadRequestException("Invalid HMAC signature");
                    }
                    console.log("✓ HMAC validation passed");
                } catch (error) {
                    console.error("HMAC computation error:", error);
                    throw error;
                }
            } else {
                console.log("⚠️ HMAC validation skipped (PAYMOB_SKIP_HMAC=true)");
            }

            // Check payment success
            if (body.obj.success != true) {
                console.log("❌ Payment not successful:", body.obj.success);
                throw new BadRequestException("Payment failed")
            }
            console.log("✓ Payment successful");
            
            // Get the merchant order ID from the order's merchant_order_id or order_id
            // In the new Unified Checkout, the special_reference we sent is available in order.merchant_order_id
            const merchantOrderId = body.obj.order?.merchant_order_id || body.obj.order?.id;
            
            if (!merchantOrderId) {
                console.log("❌ No merchant order ID found in webhook");
                throw new BadRequestException("Missing merchant order ID");
            }
            
            // Idempotent update: update only if still pending
            // Match by intentId which we stored as merchantOrderId
            const result = await this.orderRepository.updateOne(
                { intentId: String(merchantOrderId), status: OrderStatus.pending },
                { status: OrderStatus.placed, paidAt: new Date() }
            );

            return { ok: true };
        } catch (error) {
            console.error("❌ Webhook error:", error.message || error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message || "Webhook processing failed")
        }

    }
}


