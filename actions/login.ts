"use server";

import "server-only";
import { z } from 'zod';
import { LoginSchema } from '@/schemas';
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { DEFAULT_SIGNIN_REDIRECT_USER } from "@/routeslist";
import { CustomCredSignin } from "@/auth.config";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return ({ error: "Invalid fields" });
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email: email,
            password: password,
            role: "USER",
            redirect: false, // Don't redirect automatically
        })

        return ({ success: "Login successful" });

    } catch (error: unknown) {

        if (error instanceof AuthError) {
            if (error instanceof CustomCredSignin) {
                return ({ error: `${error.message}` });
            } else {
                switch (error.type) {
                    case "CredentialsSignin":
                        return ({ error: `Invalid email or password!` });
                    default:
                        return ({ error: "Something went wrong!" });
                }
            }
        }

        throw error; // imp. throw the error back to make it work
    }
};
