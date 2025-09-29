import { BadRequestException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { OrderRepository } from "src/DB/models/Order/order.repository";
import { OrderStatus } from "src/User/Order/order.interface";
import Stripe from "stripe";


@Injectable()
export class PaymentService {
    private stripe: Stripe;
    constructor(
        private readonly orderRepository: OrderRepository
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    }

    async checkoutSession(
        {
            customer_email,
            mode = "payment",
            cancel_url = process.env.CANCEL_URL,
            success_url = process.env.SUCCESS_URL,
            metadata = {},
            line_items = [],
            discounts = []
        }: Stripe.Checkout.SessionCreateParams
    ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
        const session = await this.stripe.checkout.sessions.create({
            customer_email,
            mode,
            cancel_url,
            success_url,
            metadata,
            line_items,
            discounts
        })
        return session
    }

    async createCoupon(params: Stripe.CouponCreateParams):
        Promise<Stripe.Response<Stripe.Coupon>> {
        const coupon = await this.stripe.coupons.create(params);

        return coupon
    }


    async webhook(req: Request) {
        let event = req.body;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
        const signature = req.headers['stripe-signature'];

        event = this.stripe.webhooks.constructEvent(
            req.body,
            signature as string,
            endpointSecret as string
        );


        if (event.type != "checkout.session.completed") {
            throw new BadRequestException("Fail to Pay")
        }
        


    }
    async createPaymentIntent(
        amount: number,
        currency: string = 'egp'
    ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const paymentMethod = await this.createPaymentMethod()
        const intent = await this.stripe.paymentIntents.create({
            amount: amount * 100,
            currency,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
            payment_method: paymentMethod.id

        })
        return intent
    }

    async createPaymentMethod(token: string = "tok_visa"):
        Promise<Stripe.Response<Stripe.PaymentMethod>> {
        const paymentMethod = await this.stripe.paymentMethods.create({
            type: 'card',
            card: {
                token
            }
        })
        return paymentMethod
    }

    async retrievePaymentIntent(id: string)
        : Promise<Stripe.Response<Stripe.PaymentIntent>> {
        const paymnetIntent = await this.stripe.paymentIntents.retrieve(id)
        return paymnetIntent
    }

    async confirmPaymentIntent(id: string)
        : Promise<Stripe.Response<Stripe.PaymentIntent>> {

        const intent = await this.retrievePaymentIntent(id)
        if (!intent) {
            throw new BadRequestException("In-valid payment intent")
        }
        const paymentIntent = await this.stripe.paymentIntents.confirm(
            intent.id,
            {
                payment_method: 'pm_card_visa'
            }
        )
        if (paymentIntent.status !== 'succeeded') {
            throw new BadRequestException("Fail to confirm payment intent")
        }
        return paymentIntent
    }

    async refund(id: string)
        : Promise<Stripe.Response<Stripe.Refund>> {
        const refund = await this.stripe.refunds.create({
            payment_intent: id
        })

        return refund
    }
}