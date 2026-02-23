"use client";

import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { EvoFormInputError } from "@/components/error/form-input-error";
import { ShowFormError } from "@/components/ui/form-error";
import { ShowFormSuccess } from "@/components/ui/form-success";
import axios from "@/utils/axios/axios";
import { useSearchParams } from "next/navigation";

const ResetPasswordSchema = z.object({
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const ResetPasswordForm = () => {
    const [formerror, setFormError] = useState<string>("");
    const [formsuccess, setFormSuccess] = useState<string>("");
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof ResetPasswordSchema>) => {
        setFormError("");
        setFormSuccess("");

        if (!token) {
            setFormError("Invalid reset token. Please request a new password reset.");
            return;
        }

        try {
            const response = await axios.post("/auth/reset-password", {
                token,
                password: data.password,
            });
            setFormSuccess("Password reset successfully. You can now sign in with your new password.");
        } catch (error: any) {
            if (error.response?.data?.message) {
                setFormError(error.response.data.message);
            } else {
                setFormError("An error occurred. Please try again.");
            }
        }
    };

    if (!token) {
        return (
            <AuthCardWrapper
                headerLabel="Invalid Reset Link"
                headerDescription="This password reset link is invalid or has expired"
            >
                <div className="text-center">
                    <Link 
                        href="/forgot-password" 
                        className="text-stone-600 hover:text-stone-800 transition-colors duration-200"
                    >
                        Request a new password reset
                    </Link>
                </div>
            </AuthCardWrapper>
        );
    }

    return (
        <AuthCardWrapper
            headerLabel="Reset your password"
            headerDescription="Enter your new password below"
        >
            <form id="resetpasswordform" className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col relative w-full h-fit pt-1.5">
                    <input
                        type="password"
                        id="password"
                        {...register("password")}
                        autoComplete="new-password"
                        placeholder="New password"
                        className="w-full px-3 py-2.5 sm:py-3 border border-stone-300 rounded-[6px] text-[13px] font-[400] text-stone-700 bg-stone-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-200"
                    />
                    <EvoFormInputError error={errors.password} />
                </div>

                <div className="flex flex-col relative w-full h-fit pt-1.5">
                    <input
                        type="password"
                        id="confirmPassword"
                        {...register("confirmPassword")}
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2.5 sm:py-3 border border-stone-300 rounded-[6px] text-[13px] font-[400] text-stone-700 bg-stone-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-200"
                    />
                    <EvoFormInputError error={errors.confirmPassword} />
                </div>

                <ShowFormError message={formerror} />
                <ShowFormSuccess message={formsuccess} />

                <button 
                    type="submit"
                    aria-label="reset password button"
                    disabled={isSubmitting}
                    className="w-full h-fit px-4 py-2.5 sm:py-3 text-center bg-stone-800 text-stone-50 text-[13px] font-[500] leading-4 rounded-[6px] hover:bg-stone-900 transition-colors ease-linear duration-200 disabled:opacity-50"
                >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>

                {formsuccess && (
                    <div className="flex items-center justify-center w-full pt-2">
                        <Link 
                            href="/login" 
                            className="text-[12px] text-stone-600 hover:text-stone-800 transition-colors duration-200"
                        >
                            Go to Sign In
                        </Link>
                    </div>
                )}
            </form>
        </AuthCardWrapper>
    );
}

export default ResetPasswordForm;