import LoginForm from "@/components/auth/login-form";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Sign-in",
};


const LoginPage = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-fit font-inter">
            <LoginForm />
        </div>
    );
}

export default LoginPage;
