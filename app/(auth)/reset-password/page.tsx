import ResetPasswordForm from "@/components/auth/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password",
};

const ResetPasswordPage = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-fit font-inter">
            <ResetPasswordForm />
        </div>
    );
}

export default ResetPasswordPage;