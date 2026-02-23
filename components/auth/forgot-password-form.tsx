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

const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

const ForgotPasswordForm = () => {
    const [formerror, setFormError] = useState<string>("");
    const [formsuccess, setFormSuccess] = useState<string>("");
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof ForgotPasswordSchema>) => {
        setFormError("");
        setFormSuccess("");

        try {
            const response = await axios.post("/auth/forgot-password", data);
            setFormSuccess("Password reset link sent to your email");
        } catch (error: any) {
            if (error.response?.data?.message) {
                setFormError(error.response.data.message);
            } else {
                setFormError("An error occurred. Please try again.");
            }
        }
    };

    return (
        <AuthCardWrapper
            headerLabel="Forgot your password?"
            headerDescription="Enter your email address and we'll send you a link to reset your password"
        >
            <form id="forgotpasswordform" className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col relative w-full h-fit pt-1.5">
                    <input
                        type="email"
                        id="email"
                        {...register("email")}
                        autoCorrect="off"
                        autoComplete="email"
                        spellCheck="false"
                        inputMode="email"
                        placeholder="e.g. name@example.com"
                        className="w-full px-3 py-2.5 sm:py-3 border border-stone-300 rounded-[6px] text-[13px] font-[400] text-stone-700 bg-stone-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all duration-200"
                    />
                    <EvoFormInputError error={errors.email} />
                </div>

                <ShowFormError message={formerror} />
                <ShowFormSuccess message={formsuccess} />

                <button 
                    type="submit"
                    aria-label="send reset link button"
                    disabled={isSubmitting}
                    className="w-full h-fit px-4 py-2.5 sm:py-3 text-center bg-stone-800 text-stone-50 text-[13px] font-[500] leading-4 rounded-[6px] hover:bg-stone-900 transition-colors ease-linear duration-200 disabled:opacity-50"
                >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="flex items-center justify-center w-full pt-2">
                    <Link 
                        href="/login" 
                        className="text-[12px] text-stone-600 hover:text-stone-800 transition-colors duration-200"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </AuthCardWrapper>
    );
}

export default ForgotPasswordForm;