"use server";

import axios from "@/utils/axios/axios";
import { isAxiosError } from "axios";


export const authUsingApi = async (values: { email: string; password: string; role?: "USER" | "ADMIN" | "EMPLOYEE"  }) => {

    const response = await axios.post("/auth/login",
        {
            email: values.email,
            password: values.password,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            // Return both user data and access token
            if (res.data.data?.user && res.data.data?.accessToken) {
                return {
                    ...res.data.data.user,
                    accessToken: res.data.data.accessToken
                };
            }
            return null;
        })
        .catch((err: unknown) => {
            if (isAxiosError(err)) {
                if (err.code && err.code === "ECONNREFUSED") {
                    return { apiErrMsg: "Server is possibly sleeping" };
                } else if (err.code && err.code === "ETIMEDOUT") {
                    return { apiErrMsg: "Request timed out" };
                } else if (err.response && err.response.status >= 500) {
                    return { apiErrMsg: "An unexpected error occured" };
                }
            }
            return null;
        });

    return response;
};
