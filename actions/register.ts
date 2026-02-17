"use server";

import "server-only";
import { z } from 'zod';
import { RegisterSchema } from "@/schemas";
import axios from "@/utils/axios/axios";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return ({ error: "Invalid inputs in fields" });
    }

    const { firstName, lastName, email, password } = validatedFields.data;

    // call backend api to handle registration of user
    const response = await axios.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    }
    ).then((res) => {
        return ({ success: res.data.message || "User registered successfully!" });
    }
    ).catch((err: any) => {
        if (err.response?.data?.message) {
            return ({ error: err.response.data.message });
        } else if (err.response?.data?.errorSources) {
            // Handle validation errors
            const errorMessage = err.response.data.errorSources
                .map((source: any) => source.message)
                .join(", ");
            return ({ error: errorMessage });
        } else {
            return ({ error: "Something went wrong" })
        }
    });

    return response;
};
