/* eslint-disable prettier/prettier */
import z from "zod"


export const signupSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    password: z.string(),
    confirmPassword: z.string()
}).required()


export type signupType = z.infer<typeof signupSchema>