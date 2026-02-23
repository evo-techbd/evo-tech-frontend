import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Forgot Password",
};

const ForgotPasswordPage = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-fit font-inter">
            <ForgotPasswordForm />
        </div>
    );
}

export default ForgotPasswordPage;