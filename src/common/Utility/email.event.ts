/* eslint-disable @typescript-eslint/no-misused-promises */
import { EventEmitter } from "events";
import { sendEmail } from "./sendEmail";


export const emailEvent = new EventEmitter()

emailEvent.on("sendEmail", async (data) => {
    const { email, code } = data
    await sendEmail({ to: email, subject: 'Confirm Email', html: `<h1>Welcome to Ecommerce, please confirm your code : ${code}</h1>` })
})

emailEvent.on("resetPassword", async (data) => {
    const { email, code } = data
    await sendEmail({ to: email, subject: 'Reset Password', html: `<h1>please confirm your code : ${code}</h1>` })
})

emailEvent.on("CreateOrder", async (data) => {
    const { email, order } = data
    await sendEmail({ to: email, subject: 'Order Created Successfully', html: `<h1></h1>` })
})

emailEvent.on("support", async (data) => {
    const { email, message, phone, name } = data
    await sendEmail({
        to: email, subject: 'Support', html: 
        `<p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
    })
})